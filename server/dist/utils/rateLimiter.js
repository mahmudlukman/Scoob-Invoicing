"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceWriteLimiter = exports.adminListLimiter = exports.uploadLimiter = exports.updatePasswordLimiter = exports.refreshLimiter = exports.resetPasswordLimiter = exports.forgotPasswordLimiter = exports.activateLimiter = exports.registerLimiter = exports.loginLimiter = exports.limiter = void 0;
const express_rate_limit_1 = require("express-rate-limit");
// app-wide limiter — global backstop for all routes
exports.limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 150,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { status: 429, error: "Too many requests, please try again later." },
});
// Brute-force protection — login
exports.loginLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => `${(0, express_rate_limit_1.ipKeyGenerator)(req.ip || "")}:${req.body?.email || ""}`,
    message: { status: 429, error: "Too many login attempts, please try again later." },
});
// Registration — prevent mass fake account / mail-bombing
exports.registerLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        status: 429,
        error: "Too many accounts created, please try again later.",
    },
});
// Activation token verification — token is guessable-ish via JWT brute force / replay attempts
exports.activateLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { status: 429, error: "Too many attempts, please try again later." },
});
// Forgot password — sends an email, classic abuse vector for spamming users' inboxes
exports.forgotPasswordLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 60 * 1000,
    max: 3,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (req) => req.body?.email?.toLowerCase() || (0, express_rate_limit_1.ipKeyGenerator)(req.ip || ""),
    message: { status: 429, error: "Too many requests, please try again later." },
});
// Reset password — token/id guessing protection
exports.resetPasswordLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { status: 429, error: "Too many attempts, please try again later." },
});
// Refresh token — should be cheap and frequent, but cap abuse/looping
exports.refreshLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { status: 429, error: "Too many requests, please try again later." },
});
// Update password — authenticated, key by user id not IP
exports.updatePasswordLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (req) => req.user?._id?.toString() || req.ip,
    message: { status: 429, error: "Too many attempts, please try again later." },
});
// Cloudinary upload (inside updateUserProfile) — expensive, costs you money per call
exports.uploadLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (req) => req.user?._id?.toString() || req.ip,
    message: { status: 429, error: "Too many uploads, please try again later." },
});
// Admin listing/search — cheap-ish but DB-query heavy with regex search
exports.adminListLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (req) => req.user?._id?.toString() || req.ip,
    message: { status: 429, error: "Too many requests, please try again later." },
});
// Invoice writes (create/update/duplicate) — moderate cost, prevent spam-creation
exports.invoiceWriteLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (req) => req.user?._id?.toString() || req.ip,
    message: {
        status: 429,
        error: "Too many requests, please try again later.",
    },
});
