import crypto from "crypto";
import config from "../config";

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

export type OtpPurpose = "activation" | "reset";

// Cryptographically secure 6-digit code (100000 - 999999)
export const generateOtp = (): string =>
  crypto.randomInt(100000, 1000000).toString();

// Keyed hash so a leaked DB can't be used to brute-force the 6-digit space offline
export const hashOtp = (
  otp: string,
  purpose: OtpPurpose,
  email: string,
): string =>
  crypto
    .createHmac("sha256", config.OTP_SECRET as string)
    .update(`${purpose}:${email}:${otp}`)
    .digest("hex");

// Constant-time comparison of two hex digests
export const otpMatches = (a: string, b: string): boolean => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

export const isValidOtpFormat = (otp: unknown): otp is string =>
  typeof otp === "string" && /^\d{6}$/.test(otp);
