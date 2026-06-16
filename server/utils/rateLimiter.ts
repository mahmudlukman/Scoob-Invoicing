import { rateLimit } from "express-rate-limit";

// app-wide limiter — global backstop for all routes
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { status: 429, error: "Too many requests, please try again later." },
});

// Brute-force protection — login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${req.ip}:${req.body?.email || ""}`,
  message: {
    status: 429,
    error: "Too many login attempts, please try again later.",
  },
});

// Registration — prevent mass fake account / mail-bombing
export const registerLimiter = rateLimit({
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
export const activateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { status: 429, error: "Too many attempts, please try again later." },
});

// Forgot password — sends an email, classic abuse vector for spamming users' inboxes
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.email?.toLowerCase() || req.ip,
  message: { status: 429, error: "Too many requests, please try again later." },
});

// Reset password — token/id guessing protection
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { status: 429, error: "Too many attempts, please try again later." },
});

// Refresh token — should be cheap and frequent, but cap abuse/looping
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { status: 429, error: "Too many requests, please try again later." },
});

// Update password — authenticated, key by user id not IP
export const updatePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req: any) => req.user?._id?.toString() || req.ip,
  message: { status: 429, error: "Too many attempts, please try again later." },
});

// Cloudinary upload (inside updateUserProfile) — expensive, costs you money per call
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req: any) => req.user?._id?.toString() || req.ip,
  message: { status: 429, error: "Too many uploads, please try again later." },
});

// Admin listing/search — cheap-ish but DB-query heavy with regex search
export const adminListLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req: any) => req.user?._id?.toString() || req.ip,
  message: { status: 429, error: "Too many requests, please try again later." },
});

// Invoice writes (create/update/duplicate) — moderate cost, prevent spam-creation
export const invoiceWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req: any) => req.user?._id?.toString() || req.ip,
  message: {
    status: 429,
    error: "Too many requests, please try again later.",
  },
});
