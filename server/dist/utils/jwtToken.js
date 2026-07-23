"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCSRFToken = exports.sendToken = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
const config_1 = __importDefault(require("../config"));
const crypto_1 = __importDefault(require("crypto"));
// Parse environment variables
const accessTokenExpire = parseInt(config_1.default.JWT_EXPIRES || "15", 10); // minutes
const refreshTokenExpire = parseInt(config_1.default.REFRESH_TOKEN_EXPIRES || "7", 10); // days
const isProduction = config_1.default.NODE_ENV === "production";
const cookieDomain = config_1.default.COOKIE_DOMAIN || undefined;
// Access token options (short-lived)
exports.accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 1000),
    maxAge: accessTokenExpire * 60 * 1000,
    httpOnly: true,
    sameSite: isProduction ? "strict" : "lax",
    secure: isProduction,
    path: "/",
    domain: cookieDomain,
};
// Refresh token options (long-lived)
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isProduction ? "strict" : "lax",
    secure: isProduction,
    path: "/",
    domain: cookieDomain,
};
// Send both tokens
const sendToken = (user, statusCode, res) => {
    const accessToken = user.getJwtToken();
    const refreshToken = user.getRefreshToken();
    // Set cookies
    res.cookie("access_token", accessToken, exports.accessTokenOptions);
    res.cookie("refresh_token", refreshToken, exports.refreshTokenOptions);
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(statusCode).json({
        success: true,
        user: userResponse,
        accessToken,
        refreshToken, // Include in response for mobile apps
    });
};
exports.sendToken = sendToken;
// Generate CSRF token
const generateCSRFToken = () => {
    return crypto_1.default.randomBytes(32).toString("hex");
};
exports.generateCSRFToken = generateCSRFToken;
