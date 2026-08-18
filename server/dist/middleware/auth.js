"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.requireActiveAccount = exports.isAuthenticated = void 0;
const catchAsyncErrors_1 = require("./catchAsyncErrors");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const User_1 = __importDefault(require("../models/User"));
const config_1 = __importDefault(require("../config"));
// authenticated user
exports.isAuthenticated = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
        return next(new errorHandler_1.default("Please login to access this resource", 401));
    }
    try {
        // Verify access token
        const decoded = jsonwebtoken_1.default.verify(access_token, config_1.default.JWT_SECRET_KEY);
        if (!decoded || !decoded.id) {
            return next(new errorHandler_1.default("Access token is not valid", 401));
        }
        // Get user from database
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            return next(new errorHandler_1.default("User not found", 404));
        }
        if (user.passwordChangedAt && decoded.iat) {
            const passwordChangedAtSeconds = Math.floor(user.passwordChangedAt.getTime() / 1000);
            if (decoded.iat < passwordChangedAtSeconds) {
                return next(new errorHandler_1.default("Password was recently changed. Please login again.", 401));
            }
        }
        // Attach user to request object
        req.user = user;
        next();
    }
    catch (error) {
        // Handle different JWT errors
        if (error.name === "TokenExpiredError") {
            return next(new errorHandler_1.default("Access token expired. Please refresh your token", 401));
        }
        if (error.name === "JsonWebTokenError") {
            return next(new errorHandler_1.default("Invalid access token", 401));
        }
        if (error.name === "NotBeforeError") {
            return next(new errorHandler_1.default("Access token not active yet", 401));
        }
        // Generic error
        return next(new errorHandler_1.default("Authentication failed", 401));
    }
});
// require an active (non-deactivated, non-suspended) account
const requireActiveAccount = (req, res, next) => {
    if (!req.user) {
        return next(new errorHandler_1.default("User not authenticated", 401));
    }
    if (!req.user.isActive) {
        const message = req.user.suspendedByAdmin
            ? "This account has been suspended! Try to contact the admin"
            : "Your account is deactivated. Please reactivate it to continue.";
        return next(new errorHandler_1.default(message, 403));
    }
    next();
};
exports.requireActiveAccount = requireActiveAccount;
// validate user role
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.default("User not authenticated", 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler_1.default(`Role (${req.user.role}) is not allowed to access this resource`, 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
