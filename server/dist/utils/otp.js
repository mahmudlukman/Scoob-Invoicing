"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidOtpFormat = exports.otpMatches = exports.hashOtp = exports.generateOtp = exports.OTP_RESEND_COOLDOWN_MS = exports.OTP_MAX_ATTEMPTS = exports.OTP_TTL_MS = void 0;
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../config"));
exports.OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
exports.OTP_MAX_ATTEMPTS = 5;
exports.OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
// Cryptographically secure 6-digit code (100000 - 999999)
const generateOtp = () => crypto_1.default.randomInt(100000, 1000000).toString();
exports.generateOtp = generateOtp;
// Keyed hash so a leaked DB can't be used to brute-force the 6-digit space offline
const hashOtp = (otp, purpose, email) => crypto_1.default
    .createHmac("sha256", config_1.default.OTP_SECRET)
    .update(`${purpose}:${email}:${otp}`)
    .digest("hex");
exports.hashOtp = hashOtp;
// Constant-time comparison of two hex digests
const otpMatches = (a, b) => {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && crypto_1.default.timingSafeEqual(x, y);
};
exports.otpMatches = otpMatches;
const isValidOtpFormat = (otp) => typeof otp === "string" && /^\d{6}$/.test(otp);
exports.isValidOtpFormat = isValidOtpFormat;
