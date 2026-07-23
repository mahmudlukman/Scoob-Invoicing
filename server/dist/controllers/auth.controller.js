"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.refreshAccessToken = exports.logoutUser = exports.loginUser = exports.activateUser = exports.createActivationToken = exports.createUser = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const jwtToken_1 = require("../utils/jwtToken");
const config_1 = __importDefault(require("../config"));
dotenv_1.default.config();
// @desc       Register new user
// @route      POST /api/register
// @access     pubic
exports.createUser = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { name, email, password } = req.body;
    // Normalize email to lowercase
    const emailLowerCase = email.toLowerCase().trim();
    const isEmailExist = await User_1.default.findOne({ email: emailLowerCase });
    if (isEmailExist) {
        return next(new errorHandler_1.default("Email already exist", 400));
    }
    const user = {
        name,
        email: emailLowerCase,
        password,
    };
    const activationToken = (0, exports.createActivationToken)(user);
    const activationUrl = `${config_1.default.FRONTEND_URL}/activation/${activationToken}`;
    const data = { user: { name: user.name }, activationUrl };
    try {
        await (0, sendMail_1.default)({
            email: user.email,
            subject: "Activate your account",
            template: "activation-mail.ejs",
            data,
        });
        res.status(201).json({
            success: true,
            message: `Please check your email: ${user.email} to activate your account!`,
            activationToken: activationToken,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(`Failed to send activation email: ${error.message}`, 400));
    }
});
// Function to create an activation token
const createActivationToken = (user) => {
    const token = jsonwebtoken_1.default.sign({ user }, config_1.default.ACTIVATION_SECRET, {
        expiresIn: "5m",
    });
    return token;
};
exports.createActivationToken = createActivationToken;
exports.activateUser = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { activation_token } = req.body;
    if (!activation_token) {
        return next(new errorHandler_1.default("Please provide activation token", 400));
    }
    const newUser = jsonwebtoken_1.default.verify(activation_token, config_1.default.ACTIVATION_SECRET);
    if (!newUser) {
        return next(new errorHandler_1.default("Invalid token", 400));
    }
    const { name, email, password } = newUser.user;
    let user = await User_1.default.findOne({ email });
    if (user) {
        return next(new errorHandler_1.default("User already exist", 400));
    }
    user = await User_1.default.create({
        name,
        email,
        password,
    });
    res.status(201).json({
        success: true,
        message: "Email verified & user created successfully",
    });
});
exports.loginUser = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new errorHandler_1.default("Please enter email and password", 400));
    }
    const user = await User_1.default.findOne({ email }).select("+password");
    if (!user) {
        return next(new errorHandler_1.default("Invalid credentials", 400));
    }
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        return next(new errorHandler_1.default("Invalid credentials", 400));
    }
    const { isActive } = user;
    if (!isActive) {
        return next(new errorHandler_1.default("This account has been suspended! Try to contact the admin", 403));
    }
    (0, jwtToken_1.sendToken)(user, 200, res);
});
exports.logoutUser = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    // Clear both tokens
    res.cookie("access_token", "", {
        maxAge: 1,
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    res.cookie("refresh_token", "", {
        maxAge: 1,
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});
// ============================================
// REFRESH ACCESS TOKEN
// ============================================
exports.refreshAccessToken = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const refresh_token = req.cookies.refresh_token;
    if (!refresh_token) {
        return next(new errorHandler_1.default("Please login to access this resource", 401));
    }
    // Verify refresh token
    const decoded = jsonwebtoken_1.default.verify(refresh_token, config_1.default.REFRESH_TOKEN_SECRET);
    if (!decoded) {
        return next(new errorHandler_1.default("Invalid refresh token", 401));
    }
    // Get user from database
    const user = await User_1.default.findById(decoded.id);
    if (!user) {
        return next(new errorHandler_1.default("User not found", 404));
    }
    // Check if account is active
    if (!user.isActive) {
        return next(new errorHandler_1.default("This account has been suspended! Try to contact the admin", 403));
    }
    // Generate new access token
    const newAccessToken = user.getJwtToken();
    // Generate new refresh token (token rotation for security)
    const newRefreshToken = user.getRefreshToken();
    // Set new cookies
    res.cookie("access_token", newAccessToken, jwtToken_1.accessTokenOptions);
    res.cookie("refresh_token", newRefreshToken, jwtToken_1.refreshTokenOptions);
    // Also send in response for frontend state management
    res.status(200).json({
        success: true,
        accessToken: newAccessToken,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        },
    });
});
exports.forgotPassword = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new errorHandler_1.default("Please provide a valid email!", 400));
    }
    const emailLowerCase = email.toLowerCase();
    const user = await User_1.default.findOne({ email: emailLowerCase });
    if (!user) {
        return next(new errorHandler_1.default("User not found, invalid request!", 400));
    }
    const { isActive } = user;
    if (!isActive) {
        return next(new errorHandler_1.default("This account has been suspended! Try to contact the admin", 403));
    }
    const resetToken = (0, exports.createActivationToken)(user);
    const resetUrl = `${config_1.default.FRONTEND_URL}/reset-password?token=${resetToken}&id=${user._id}`;
    const data = { user: { name: user.name }, resetUrl };
    try {
        await (0, sendMail_1.default)({
            email: user.email,
            subject: "Reset your password",
            template: "forgot-password-mail.ejs",
            data,
        });
        res.status(201).json({
            success: true,
            message: `Please check your email: ${user.email} to reset your password!`,
            resetToken: resetToken,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
exports.resetPassword = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { newPassword } = req.body;
    const { token } = req.query;
    if (!token || typeof token !== "string") {
        return next(new errorHandler_1.default("Reset token is required", 400));
    }
    if (!newPassword) {
        return next(new errorHandler_1.default("Please provide a new password", 400));
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, config_1.default.ACTIVATION_SECRET);
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(new errorHandler_1.default("Reset token has expired", 400));
        }
        return next(new errorHandler_1.default("Invalid or expired reset token", 400));
    }
    const user = await User_1.default.findOne({ email: decoded.user.email }).select("+password");
    if (!user) {
        return next(new errorHandler_1.default("User not found", 404));
    }
    if (!user.isActive) {
        return next(new errorHandler_1.default("This account has been suspended! Try to contact the admin", 403));
    }
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
        return next(new errorHandler_1.default("New password must be different from the previous one!", 400));
    }
    if (newPassword.trim().length < 6 || newPassword.trim().length > 20) {
        return next(new errorHandler_1.default("Password must be between 6 and 20 characters!", 400));
    }
    user.password = newPassword.trim();
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password reset successfully! Now you can login with your new password!",
    });
});
// update user password
// interface IResetPassword {
//   newPassword: string;
// }
// // reset password
// export const resetPassword = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { newPassword } = req.body as IResetPassword;
//     const { id } = req.query;
//     if (!id) {
//       return next(new ErrorHandler("No user ID provided!", 400));
//     }
//     const user = await User.findById(id).select("+password");
//     if (!user) {
//       return next(new ErrorHandler("user not found!", 400));
//     }
//     const isSamePassword = await user.comparePassword(newPassword);
//     if (isSamePassword)
//       return next(
//         new ErrorHandler(
//           "New password must be different from the previous one!",
//           400
//         )
//       );
//     if (newPassword.trim().length < 6 || newPassword.trim().length > 20) {
//       return next(
//         new ErrorHandler("Password must be between at least 6 characters!", 400)
//       );
//     }
//     user.password = newPassword.trim();
//     await user.save();
//     res.status(201).json({
//       success: true,
//       message: `Password Reset Successfully', 'Now you can login with new password!`,
//     });
//   }
// );
