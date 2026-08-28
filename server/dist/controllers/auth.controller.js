"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.refreshAccessToken = exports.logoutUser = exports.loginUser = exports.activateUser = exports.createActivationToken = exports.createUser = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const jwtToken_1 = require("../utils/jwtToken");
const config_1 = __importDefault(require("../config"));
const disposableDomains = [
    "tempmail.com",
    "throwaway.com",
    "throwawaymail.com",
    "guerrillamail.com",
    "mailinator.com",
    "10minutemail.com",
    "yopmail.com",
    "temp-mail.org",
    "trashmail.com",
    "dropmail.me",
];
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 20;
const isValidPasswordLength = (password) => password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH;
// @desc       Register new user
// @route      POST /api/register
// @access     public
exports.createUser = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return next(new errorHandler_1.default("Please provide name, email and password", 400));
    }
    const emailLowerCase = email.toLowerCase().trim();
    if (!isValidPasswordLength(password)) {
        return next(new errorHandler_1.default(`Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters!`, 400));
    }
    const isEmailExist = await User_1.default.findOne({ email: emailLowerCase });
    if (isEmailExist) {
        return next(new errorHandler_1.default("Email already exist", 400));
    }
    // Check if email is from disposable domain
    const domain = emailLowerCase.split("@")[1];
    if (disposableDomains.includes(domain)) {
        return next(new errorHandler_1.default("Please use a permanent email address", 400));
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = {
        name,
        email: emailLowerCase,
        password: hashedPassword,
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
            ...(config_1.default.NODE_ENV !== "production" && { activationToken }),
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(`Failed to send activation email: ${error.message}`, 400));
    }
});
// Signs the activation payload.
const createActivationToken = (user) => {
    return jsonwebtoken_1.default.sign({ user, purpose: "activation" }, config_1.default.ACTIVATION_SECRET, { expiresIn: "5m" });
};
exports.createActivationToken = createActivationToken;
// export const activateUser = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { activation_token } = req.body as IActivationRequest;
//     if (!activation_token) {
//       return next(new ErrorHandler("Please provide activation token", 400));
//     }
//     let decoded: { user: ICreateUser; purpose: string };
//     try {
//       decoded = jwt.verify(
//         activation_token,
//         config.ACTIVATION_SECRET as string,
//       ) as { user: ICreateUser; purpose: string };
//     } catch (error: any) {
//       if (error.name === "TokenExpiredError") {
//         return next(
//           new ErrorHandler(
//             "Activation link has expired. Please sign up again.",
//             400,
//           ),
//         );
//       }
//       return next(new ErrorHandler("Invalid activation token", 400));
//     }
//     if (decoded.purpose !== "activation") {
//       return next(new ErrorHandler("Invalid activation token", 400));
//     }
//     const { name, email, password } = decoded.user;
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return next(new ErrorHandler("User already exist", 400));
//     }
//     const newUser = new User({ name, email, password });
//     newUser.$locals.skipHash = true;
//     await newUser.save();
//     res.status(201).json({
//       success: true,
//       message: "Email verified & user created successfully",
//     });
//   },
// );
exports.activateUser = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { activation_token } = req.body;
    if (!activation_token) {
        return next(new errorHandler_1.default("Please provide activation token", 400));
    }
    let decoded;
    // Verify activation token
    try {
        decoded = jsonwebtoken_1.default.verify(activation_token, config_1.default.ACTIVATION_SECRET);
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(new errorHandler_1.default("Activation link has expired. Please sign up again.", 400));
        }
        return next(new errorHandler_1.default("Invalid activation token", 400));
    }
    if (decoded.purpose !== "activation") {
        return next(new errorHandler_1.default("Invalid activation token", 400));
    }
    const { name, email, password } = decoded.user;
    // Prevent duplicate account creation
    const existingUser = await User_1.default.findOne({ email });
    if (existingUser) {
        return next(new errorHandler_1.default("User already exist", 400));
    }
    // Create the user
    const newUser = new User_1.default({
        name,
        email,
        password,
    });
    newUser.$locals.skipHash = true;
    await newUser.save();
    try {
        const siteUrl = config_1.default.FRONTEND_URL;
        await (0, sendMail_1.default)({
            email: newUser.email,
            subject: "Welcome to Skoob Invoice 🎉",
            template: "welcome-mail.ejs",
            data: {
                user: {
                    name: newUser.name,
                },
                siteUrl,
            },
        });
    }
    catch (error) {
        // Log the email failure without failing account activation.
        console.error(`Failed to send welcome email to ${newUser.email}:`, error);
    }
    return res.status(201).json({
        success: true,
        message: "Email verified & user created successfully",
    });
});
exports.loginUser = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new errorHandler_1.default("Please enter email and password", 400));
    }
    const emailLowerCase = email.toLowerCase().trim();
    const user = await User_1.default.findOne({ email: emailLowerCase }).select("+password");
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
// @desc       Logout user
// @route      POST /api/logout
// @access     public
exports.logoutUser = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
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
// @desc       Refresh Access Token
// @route      POST /api/refresh-token
// @access     public
exports.refreshAccessToken = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const refresh_token = req.cookies.refresh_token;
    if (!refresh_token) {
        return next(new errorHandler_1.default("Please login to access this resource", 401));
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(refresh_token, config_1.default.REFRESH_TOKEN_SECRET);
    }
    catch (error) {
        return next(new errorHandler_1.default("Session expired. Please login again.", 401));
    }
    const user = await User_1.default.findById(decoded.id);
    if (!user) {
        return next(new errorHandler_1.default("User not found", 404));
    }
    if (!user.isActive) {
        return next(new errorHandler_1.default("This account has been suspended! Try to contact the admin", 403));
    }
    if (user.passwordChangedAt) {
        const passwordChangedAtSeconds = Math.floor(user.passwordChangedAt.getTime() / 1000);
        if (decoded.iat < passwordChangedAtSeconds) {
            return next(new errorHandler_1.default("Session expired. Please login again.", 401));
        }
    }
    const newAccessToken = user.getJwtToken();
    const newRefreshToken = user.getRefreshToken();
    res.cookie("access_token", newAccessToken, jwtToken_1.accessTokenOptions);
    res.cookie("refresh_token", newRefreshToken, jwtToken_1.refreshTokenOptions);
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
// @desc       Forgot password
// @route      POST /api/forgot-password
// @access     public
exports.forgotPassword = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new errorHandler_1.default("Please provide a valid email!", 400));
    }
    const emailLowerCase = email.toLowerCase().trim();
    const user = await User_1.default.findOne({ email: emailLowerCase });
    const genericMessage = `If an account exists for ${email}, a password reset link has been sent.`;
    if (!user || !user.isActive) {
        return res.status(200).json({ success: true, message: genericMessage });
    }
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    const hashedToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    user.resetPasswordToken = hashedToken;
    user.resetPasswordTime = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${config_1.default.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const data = { user: { name: user.name }, resetUrl };
    try {
        await (0, sendMail_1.default)({
            email: user.email,
            subject: "Reset your password",
            template: "forgot-password-mail.ejs",
            data,
        });
        res.status(200).json({ success: true, message: genericMessage });
    }
    catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordTime = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new errorHandler_1.default("Failed to send reset email. Please try again.", 500));
    }
});
exports.resetPassword = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { token } = req.query;
    const { newPassword } = req.body;
    if (!token || typeof token !== "string") {
        return next(new errorHandler_1.default("Reset token is required", 400));
    }
    if (!newPassword) {
        return next(new errorHandler_1.default("Please provide a new password", 400));
    }
    const trimmedPassword = newPassword.trim();
    if (!isValidPasswordLength(trimmedPassword)) {
        return next(new errorHandler_1.default(`Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters!`, 400));
    }
    const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
    const user = await User_1.default.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordTime: { $gt: new Date() },
    }).select("+password");
    if (!user) {
        return next(new errorHandler_1.default("Invalid or expired reset token", 400));
    }
    if (!user.isActive) {
        return next(new errorHandler_1.default("This account has been suspended! Try to contact the admin", 403));
    }
    const isSamePassword = await user.comparePassword(trimmedPassword);
    if (isSamePassword) {
        return next(new errorHandler_1.default("New password must be different from the previous one!", 400));
    }
    user.password = trimmedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTime = undefined;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password reset successfully! Now you can login with your new password!",
    });
});
