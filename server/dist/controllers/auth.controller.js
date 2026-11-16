"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.refreshAccessToken = exports.logoutUser = exports.loginUser = exports.activateUser = exports.resendActivationOtp = exports.createUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const PendingUser_1 = __importDefault(require("../models/PendingUser"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const jwtToken_1 = require("../utils/jwtToken");
const otp_1 = require("../utils/otp");
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
const OTP_EXPIRES_IN_MINUTES = otp_1.OTP_TTL_MS / 60000;
const isValidPasswordLength = (password) => password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH;
// Dev helper: never return the code in the API response, just log it.
const logOtpInDev = (label, email, otp) => {
    if (config_1.default.NODE_ENV !== "production") {
        console.log(`[DEV] ${label} code for ${email}: ${otp}`);
    }
};
// --------------------------------------------------
// Register user
// --------------------------------------------------
// @desc       Register new user (sends a 6-digit activation code)
// @route      POST /api/register
// @access     public
exports.createUser = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return next(new errorHandler_1.default("Please provide name, email and password", 400));
    }
    const emailLowerCase = String(email).toLowerCase().trim();
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
    // Resend cooldown for an existing pending signup
    const existingPending = await PendingUser_1.default.findOne({
        email: emailLowerCase,
    });
    if (existingPending &&
        Date.now() - existingPending.lastSentAt.getTime() < otp_1.OTP_RESEND_COOLDOWN_MS) {
        return next(new errorHandler_1.default("Please wait a minute before requesting a new code", 429));
    }
    const otp = (0, otp_1.generateOtp)();
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    await PendingUser_1.default.findOneAndUpdate({ email: emailLowerCase }, {
        name,
        password: hashedPassword,
        otpHash: (0, otp_1.hashOtp)(otp, "activation", emailLowerCase),
        attempts: 0,
        lastSentAt: new Date(),
        expiresAt: new Date(Date.now() + otp_1.OTP_TTL_MS),
    }, { upsert: true, new: true });
    logOtpInDev("Activation", emailLowerCase, otp);
    try {
        await (0, sendMail_1.default)({
            email: emailLowerCase,
            subject: "Your activation code",
            template: "activation-mail.ejs",
            data: {
                user: { name },
                otp,
                expiresInMinutes: OTP_EXPIRES_IN_MINUTES,
            },
        });
        res.status(201).json({
            success: true,
            message: `We sent a 6-digit code to ${emailLowerCase}`,
        });
    }
    catch (error) {
        await PendingUser_1.default.deleteOne({ email: emailLowerCase });
        return next(new errorHandler_1.default(`Failed to send activation email: ${error.message}`, 500));
    }
});
// @desc       Resend activation code
// @route      POST /api/resend-activation
// @access     public
exports.resendActivationOtp = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new errorHandler_1.default("Please provide your email", 400));
    }
    const emailLowerCase = String(email).toLowerCase().trim();
    const pending = await PendingUser_1.default.findOne({ email: emailLowerCase });
    if (!pending) {
        return next(new errorHandler_1.default("No pending signup found for this email. Please sign up again.", 400));
    }
    if (Date.now() - pending.lastSentAt.getTime() < otp_1.OTP_RESEND_COOLDOWN_MS) {
        return next(new errorHandler_1.default("Please wait a minute before requesting a new code", 429));
    }
    const otp = (0, otp_1.generateOtp)();
    pending.otpHash = (0, otp_1.hashOtp)(otp, "activation", emailLowerCase);
    pending.attempts = 0;
    pending.lastSentAt = new Date();
    pending.expiresAt = new Date(Date.now() + otp_1.OTP_TTL_MS);
    await pending.save();
    logOtpInDev("Activation", emailLowerCase, otp);
    try {
        await (0, sendMail_1.default)({
            email: emailLowerCase,
            subject: "Your activation code",
            template: "activation-mail.ejs",
            data: {
                user: { name: pending.name },
                otp,
                expiresInMinutes: OTP_EXPIRES_IN_MINUTES,
            },
        });
        res.status(200).json({
            success: true,
            message: `We sent a new 6-digit code to ${emailLowerCase}`,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Failed to send activation email. Please try again.", 500));
    }
});
exports.activateUser = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return next(new errorHandler_1.default("Please provide email and code", 400));
    }
    const emailLowerCase = String(email).toLowerCase().trim();
    if (!(0, otp_1.isValidOtpFormat)(otp)) {
        return next(new errorHandler_1.default("Code must be 6 digits", 400));
    }
    // Count the attempt atomically BEFORE comparing, so parallel requests
    // can't get extra guesses.
    const pending = await PendingUser_1.default.findOneAndUpdate({ email: emailLowerCase, expiresAt: { $gt: new Date() } }, { $inc: { attempts: 1 } }, { new: true });
    if (!pending) {
        return next(new errorHandler_1.default("Code expired or invalid. Please sign up again.", 400));
    }
    if (pending.attempts > otp_1.OTP_MAX_ATTEMPTS) {
        await pending.deleteOne();
        return next(new errorHandler_1.default("Too many attempts. Please sign up again.", 429));
    }
    if (!(0, otp_1.otpMatches)(pending.otpHash, (0, otp_1.hashOtp)(otp, "activation", emailLowerCase))) {
        return next(new errorHandler_1.default("Invalid code", 400));
    }
    // Prevent duplicate account creation
    const existingUser = await User_1.default.findOne({ email: emailLowerCase });
    if (existingUser) {
        await pending.deleteOne();
        return next(new errorHandler_1.default("User already exist", 400));
    }
    // Create the user (password is already hashed)
    const newUser = new User_1.default({
        name: pending.name,
        email: pending.email,
        password: pending.password,
    });
    newUser.$locals.skipHash = true;
    await newUser.save();
    await pending.deleteOne();
    try {
        await (0, sendMail_1.default)({
            email: newUser.email,
            subject: "Welcome to Skoob Invoice 🎉",
            template: "welcome-mail.ejs",
            data: {
                user: {
                    name: newUser.name,
                },
                siteUrl: config_1.default.FRONTEND_URL,
            },
        });
    }
    catch (error) {
        // Log the email failure without failing account activation.
        console.error(`Failed to send welcome email to ${newUser.email}:`, error);
    }
    (0, jwtToken_1.sendToken)(newUser, 201, res);
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
// @desc       Forgot password (sends a 6-digit reset code)
// @route      POST /api/forgot-password
// @access     public
exports.forgotPassword = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new errorHandler_1.default("Please provide a valid email!", 400));
    }
    const emailLowerCase = String(email).toLowerCase().trim();
    const user = await User_1.default.findOne({ email: emailLowerCase }).select("+resetPasswordToken");
    const genericMessage = `If an account exists for ${emailLowerCase}, a 6-digit reset code has been sent.`;
    if (!user || !user.isActive) {
        return res.status(200).json({ success: true, message: genericMessage });
    }
    // Resend cooldown. Return the generic message so the response doesn't
    // reveal that the account exists.
    if (user.resetPasswordTime) {
        const lastSentAt = user.resetPasswordTime.getTime() - otp_1.OTP_TTL_MS;
        if (Date.now() - lastSentAt < otp_1.OTP_RESEND_COOLDOWN_MS) {
            return res.status(200).json({ success: true, message: genericMessage });
        }
    }
    const otp = (0, otp_1.generateOtp)();
    user.resetPasswordToken = (0, otp_1.hashOtp)(otp, "reset", user.email);
    user.resetPasswordTime = new Date(Date.now() + otp_1.OTP_TTL_MS);
    user.resetPasswordAttempts = 0;
    await user.save({ validateBeforeSave: false });
    logOtpInDev("Reset", user.email, otp);
    try {
        await (0, sendMail_1.default)({
            email: user.email,
            subject: "Your password reset code",
            template: "forgot-password-mail.ejs",
            data: {
                user: { name: user.name },
                otp,
                expiresInMinutes: OTP_EXPIRES_IN_MINUTES,
            },
        });
        res.status(200).json({ success: true, message: genericMessage });
    }
    catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordTime = undefined;
        user.resetPasswordAttempts = 0;
        await user.save({ validateBeforeSave: false });
        return next(new errorHandler_1.default("Failed to send reset email. Please try again.", 500));
    }
});
exports.resetPassword = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp) {
        return next(new errorHandler_1.default("Please provide email and code", 400));
    }
    if (!newPassword) {
        return next(new errorHandler_1.default("Please provide a new password", 400));
    }
    const emailLowerCase = String(email).toLowerCase().trim();
    if (!(0, otp_1.isValidOtpFormat)(otp)) {
        return next(new errorHandler_1.default("Code must be 6 digits", 400));
    }
    const trimmedPassword = newPassword.trim();
    if (!isValidPasswordLength(trimmedPassword)) {
        return next(new errorHandler_1.default(`Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters!`, 400));
    }
    // Count the attempt atomically BEFORE comparing.
    const user = await User_1.default.findOneAndUpdate({ email: emailLowerCase, resetPasswordTime: { $gt: new Date() } }, { $inc: { resetPasswordAttempts: 1 } }, { new: true }).select("+password +resetPasswordToken");
    if (!user || !user.resetPasswordToken) {
        return next(new errorHandler_1.default("Invalid or expired code", 400));
    }
    if ((user.resetPasswordAttempts ?? 0) > otp_1.OTP_MAX_ATTEMPTS) {
        user.resetPasswordToken = undefined;
        user.resetPasswordTime = undefined;
        user.resetPasswordAttempts = 0;
        await user.save({ validateBeforeSave: false });
        return next(new errorHandler_1.default("Too many attempts. Please request a new code.", 429));
    }
    if (!(0, otp_1.otpMatches)(user.resetPasswordToken, (0, otp_1.hashOtp)(otp, "reset", emailLowerCase))) {
        return next(new errorHandler_1.default("Invalid or expired code", 400));
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
    user.resetPasswordAttempts = 0;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password reset successfully! Now you can login with your new password!",
    });
});
