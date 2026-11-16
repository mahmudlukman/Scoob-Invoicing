import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import PendingUser from "../models/PendingUser";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncError } from "../middleware/catchAsyncErrors";
import sendMail from "../utils/sendMail";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwtToken";
import {
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
  generateOtp,
  hashOtp,
  isValidOtpFormat,
  otpMatches,
} from "../utils/otp";
import config from "../config";

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
const OTP_EXPIRES_IN_MINUTES = OTP_TTL_MS / 60000;

const isValidPasswordLength = (password: string): boolean =>
  password.length >= MIN_PASSWORD_LENGTH &&
  password.length <= MAX_PASSWORD_LENGTH;

// Dev helper: never return the code in the API response, just log it.
const logOtpInDev = (label: string, email: string, otp: string): void => {
  if (config.NODE_ENV !== "production") {
    console.log(`[DEV] ${label} code for ${email}: ${otp}`);
  }
};

// --------------------------------------------------
// Register user
// --------------------------------------------------

// @desc       Register new user (sends a 6-digit activation code)
// @route      POST /api/register
// @access     public
export const createUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(
        new ErrorHandler("Please provide name, email and password", 400),
      );
    }

    const emailLowerCase = String(email).toLowerCase().trim();

    if (!isValidPasswordLength(password)) {
      return next(
        new ErrorHandler(
          `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters!`,
          400,
        ),
      );
    }

    const isEmailExist = await User.findOne({ email: emailLowerCase });
    if (isEmailExist) {
      return next(new ErrorHandler("Email already exist", 400));
    }

    // Check if email is from disposable domain
    const domain = emailLowerCase.split("@")[1];
    if (disposableDomains.includes(domain)) {
      return next(
        new ErrorHandler("Please use a permanent email address", 400),
      );
    }

    // Resend cooldown for an existing pending signup
    const existingPending = await PendingUser.findOne({
      email: emailLowerCase,
    });
    if (
      existingPending &&
      Date.now() - existingPending.lastSentAt.getTime() < OTP_RESEND_COOLDOWN_MS
    ) {
      return next(
        new ErrorHandler(
          "Please wait a minute before requesting a new code",
          429,
        ),
      );
    }

    const otp = generateOtp();
    const hashedPassword = await bcrypt.hash(password, 10);

    await PendingUser.findOneAndUpdate(
      { email: emailLowerCase },
      {
        name,
        password: hashedPassword,
        otpHash: hashOtp(otp, "activation", emailLowerCase),
        attempts: 0,
        lastSentAt: new Date(),
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
      { upsert: true, new: true },
    );

    logOtpInDev("Activation", emailLowerCase, otp);

    try {
      await sendMail({
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
    } catch (error: any) {
      await PendingUser.deleteOne({ email: emailLowerCase });
      return next(
        new ErrorHandler(
          `Failed to send activation email: ${error.message}`,
          500,
        ),
      );
    }
  },
);

// @desc       Resend activation code
// @route      POST /api/resend-activation
// @access     public
export const resendActivationOtp = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      return next(new ErrorHandler("Please provide your email", 400));
    }

    const emailLowerCase = String(email).toLowerCase().trim();

    const pending = await PendingUser.findOne({ email: emailLowerCase });
    if (!pending) {
      return next(
        new ErrorHandler(
          "No pending signup found for this email. Please sign up again.",
          400,
        ),
      );
    }

    if (Date.now() - pending.lastSentAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
      return next(
        new ErrorHandler(
          "Please wait a minute before requesting a new code",
          429,
        ),
      );
    }

    const otp = generateOtp();

    pending.otpHash = hashOtp(otp, "activation", emailLowerCase);
    pending.attempts = 0;
    pending.lastSentAt = new Date();
    pending.expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await pending.save();

    logOtpInDev("Activation", emailLowerCase, otp);

    try {
      await sendMail({
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
    } catch (error: any) {
      return next(
        new ErrorHandler(
          "Failed to send activation email. Please try again.",
          500,
        ),
      );
    }
  },
);

// @desc       Activate new user with the 6-digit code
// @route      POST /api/activate-user
// @access     public
interface IActivationRequest {
  email: string;
  otp: string;
}

export const activateUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body as IActivationRequest;

    if (!email || !otp) {
      return next(new ErrorHandler("Please provide email and code", 400));
    }

    const emailLowerCase = String(email).toLowerCase().trim();

    if (!isValidOtpFormat(otp)) {
      return next(new ErrorHandler("Code must be 6 digits", 400));
    }

    // Count the attempt atomically BEFORE comparing, so parallel requests
    // can't get extra guesses.
    const pending = await PendingUser.findOneAndUpdate(
      { email: emailLowerCase, expiresAt: { $gt: new Date() } },
      { $inc: { attempts: 1 } },
      { new: true },
    );

    if (!pending) {
      return next(
        new ErrorHandler("Code expired or invalid. Please sign up again.", 400),
      );
    }

    if (pending.attempts > OTP_MAX_ATTEMPTS) {
      await pending.deleteOne();
      return next(
        new ErrorHandler("Too many attempts. Please sign up again.", 429),
      );
    }

    if (
      !otpMatches(pending.otpHash, hashOtp(otp, "activation", emailLowerCase))
    ) {
      return next(new ErrorHandler("Invalid code", 400));
    }

    // Prevent duplicate account creation
    const existingUser = await User.findOne({ email: emailLowerCase });
    if (existingUser) {
      await pending.deleteOne();
      return next(new ErrorHandler("User already exist", 400));
    }

    // Create the user (password is already hashed)
    const newUser = new User({
      name: pending.name,
      email: pending.email,
      password: pending.password,
    });

    newUser.$locals.skipHash = true;

    await newUser.save();
    await pending.deleteOne();

    try {
      await sendMail({
        email: newUser.email,
        subject: "Welcome to Skoob Invoice 🎉",
        template: "welcome-mail.ejs",
        data: {
          user: {
            name: newUser.name,
          },
          siteUrl: config.FRONTEND_URL,
        },
      });
    } catch (error: any) {
      // Log the email failure without failing account activation.
      console.error(`Failed to send welcome email to ${newUser.email}:`, error);
    }

    sendToken(newUser, 201, res);
  },
);

// @desc       Login user
// @route      POST /api/login
// @access     public
interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as ILoginRequest;

    if (!email || !password) {
      return next(new ErrorHandler("Please enter email and password", 400));
    }

    const emailLowerCase = email.toLowerCase().trim();

    const user = await User.findOne({ email: emailLowerCase }).select(
      "+password",
    );

    if (!user) {
      return next(new ErrorHandler("Invalid credentials", 400));
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid credentials", 400));
    }

    const { isActive } = user;
    if (!isActive) {
      return next(
        new ErrorHandler(
          "This account has been suspended! Try to contact the admin",
          403,
        ),
      );
    }

    sendToken(user, 200, res);
  },
);

// @desc       Logout user
// @route      POST /api/logout
// @access     public
export const logoutUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
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
  },
);

// @desc       Refresh Access Token
// @route      POST /api/refresh-token
// @access     public
export const refreshAccessToken = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const refresh_token = req.cookies.refresh_token as string;

    if (!refresh_token) {
      return next(
        new ErrorHandler("Please login to access this resource", 401),
      );
    }

    let decoded: { id: string; iat: number };
    try {
      decoded = jwt.verify(
        refresh_token,
        config.REFRESH_TOKEN_SECRET as Secret,
      ) as { id: string; iat: number };
    } catch (error: any) {
      return next(
        new ErrorHandler("Session expired. Please login again.", 401),
      );
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (!user.isActive) {
      return next(
        new ErrorHandler(
          "This account has been suspended! Try to contact the admin",
          403,
        ),
      );
    }

    if (user.passwordChangedAt) {
      const passwordChangedAtSeconds = Math.floor(
        user.passwordChangedAt.getTime() / 1000,
      );
      if (decoded.iat < passwordChangedAtSeconds) {
        return next(
          new ErrorHandler("Session expired. Please login again.", 401),
        );
      }
    }

    const newAccessToken = user.getJwtToken();
    const newRefreshToken = user.getRefreshToken();

    res.cookie("access_token", newAccessToken, accessTokenOptions);
    res.cookie("refresh_token", newRefreshToken, refreshTokenOptions);

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
  },
);

// @desc       Forgot password (sends a 6-digit reset code)
// @route      POST /api/forgot-password
// @access     public
export const forgotPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) {
      return next(new ErrorHandler("Please provide a valid email!", 400));
    }

    const emailLowerCase = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: emailLowerCase }).select(
      "+resetPasswordToken",
    );

    const genericMessage = `If an account exists for ${emailLowerCase}, a 6-digit reset code has been sent.`;

    if (!user || !user.isActive) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    // Resend cooldown. Return the generic message so the response doesn't
    // reveal that the account exists.
    if (user.resetPasswordTime) {
      const lastSentAt = user.resetPasswordTime.getTime() - OTP_TTL_MS;
      if (Date.now() - lastSentAt < OTP_RESEND_COOLDOWN_MS) {
        return res.status(200).json({ success: true, message: genericMessage });
      }
    }

    const otp = generateOtp();

    user.resetPasswordToken = hashOtp(otp, "reset", user.email);
    user.resetPasswordTime = new Date(Date.now() + OTP_TTL_MS);
    user.resetPasswordAttempts = 0;
    await user.save({ validateBeforeSave: false });

    logOtpInDev("Reset", user.email, otp);

    try {
      await sendMail({
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
    } catch (error: any) {
      user.resetPasswordToken = undefined;
      user.resetPasswordTime = undefined;
      user.resetPasswordAttempts = 0;
      await user.save({ validateBeforeSave: false });

      return next(
        new ErrorHandler("Failed to send reset email. Please try again.", 500),
      );
    }
  },
);

// @desc       Reset password with the 6-digit code
// @route      POST /api/reset-password
// @access     public
interface IResetPassword {
  email: string;
  otp: string;
  newPassword: string;
}

export const resetPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp, newPassword } = req.body as IResetPassword;

    if (!email || !otp) {
      return next(new ErrorHandler("Please provide email and code", 400));
    }

    if (!newPassword) {
      return next(new ErrorHandler("Please provide a new password", 400));
    }

    const emailLowerCase = String(email).toLowerCase().trim();

    if (!isValidOtpFormat(otp)) {
      return next(new ErrorHandler("Code must be 6 digits", 400));
    }

    const trimmedPassword = newPassword.trim();
    if (!isValidPasswordLength(trimmedPassword)) {
      return next(
        new ErrorHandler(
          `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters!`,
          400,
        ),
      );
    }

    // Count the attempt atomically BEFORE comparing.
    const user = await User.findOneAndUpdate(
      { email: emailLowerCase, resetPasswordTime: { $gt: new Date() } },
      { $inc: { resetPasswordAttempts: 1 } },
      { new: true },
    ).select("+password +resetPasswordToken");

    if (!user || !user.resetPasswordToken) {
      return next(new ErrorHandler("Invalid or expired code", 400));
    }

    if ((user.resetPasswordAttempts ?? 0) > OTP_MAX_ATTEMPTS) {
      user.resetPasswordToken = undefined;
      user.resetPasswordTime = undefined;
      user.resetPasswordAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return next(
        new ErrorHandler("Too many attempts. Please request a new code.", 429),
      );
    }

    if (
      !otpMatches(
        user.resetPasswordToken,
        hashOtp(otp, "reset", emailLowerCase),
      )
    ) {
      return next(new ErrorHandler("Invalid or expired code", 400));
    }

    if (!user.isActive) {
      return next(
        new ErrorHandler(
          "This account has been suspended! Try to contact the admin",
          403,
        ),
      );
    }

    const isSamePassword = await user.comparePassword(trimmedPassword);
    if (isSamePassword) {
      return next(
        new ErrorHandler(
          "New password must be different from the previous one!",
          400,
        ),
      );
    }

    user.password = trimmedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTime = undefined;
    user.resetPasswordAttempts = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully! Now you can login with your new password!",
    });
  },
);
