import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../models/User";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncError } from "../middleware/catchAsyncErrors";
import sendMail from "../utils/sendMail";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwtToken";
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

const isValidPasswordLength = (password: string): boolean =>
  password.length >= MIN_PASSWORD_LENGTH &&
  password.length <= MAX_PASSWORD_LENGTH;

// --------------------------------------------------
// Register user
// --------------------------------------------------

interface ICreateUser {
  name: string;
  email: string;
  password: string;
}

// @desc       Register new user
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

    const emailLowerCase = email.toLowerCase().trim();

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user: ICreateUser = {
      name,
      email: emailLowerCase,
      password: hashedPassword,
    };

    const activationToken = createActivationToken(user);
    const activationUrl = `${config.FRONTEND_URL}/activation/${activationToken}`;
    const data = { user: { name: user.name }, activationUrl };

    try {
      await sendMail({
        email: user.email,
        subject: "Activate your account",
        template: "activation-mail.ejs",
        data,
      });

      res.status(201).json({
        success: true,
        message: `Please check your email: ${user.email} to activate your account!`,
        ...(config.NODE_ENV !== "production" && { activationToken }),
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(
          `Failed to send activation email: ${error.message}`,
          400,
        ),
      );
    }
  },
);

// Signs the activation payload.
export const createActivationToken = (user: ICreateUser): string => {
  return jwt.sign(
    { user, purpose: "activation" },
    config.ACTIVATION_SECRET as Secret,
    { expiresIn: "5m" },
  );
};

// @desc       Activate new user
// @route      POST /api/activate-user
// @access     public
interface IActivationRequest {
  activation_token: string;
}

export const activateUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { activation_token } = req.body as IActivationRequest;
    if (!activation_token) {
      return next(new ErrorHandler("Please provide activation token", 400));
    }

    let decoded: { user: ICreateUser; purpose: string };
    try {
      decoded = jwt.verify(
        activation_token,
        config.ACTIVATION_SECRET as string,
      ) as { user: ICreateUser; purpose: string };
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return next(
          new ErrorHandler(
            "Activation link has expired. Please sign up again.",
            400,
          ),
        );
      }
      return next(new ErrorHandler("Invalid activation token", 400));
    }

    if (decoded.purpose !== "activation") {
      return next(new ErrorHandler("Invalid activation token", 400));
    }

    const { name, email, password } = decoded.user;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("User already exist", 400));
    }

    const newUser = new User({ name, email, password });
    newUser.$locals.skipHash = true;
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Email verified & user created successfully",
    });
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

// @desc       Forgot password
// @route      POST /api/forgot-password
// @access     public
export const forgotPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) {
      return next(new ErrorHandler("Please provide a valid email!", 400));
    }

    const emailLowerCase = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLowerCase });

    const genericMessage = `If an account exists for ${email}, a password reset link has been sent.`;

    if (!user || !user.isActive) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordTime = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const data = { user: { name: user.name }, resetUrl };

    try {
      await sendMail({
        email: user.email,
        subject: "Reset your password",
        template: "forgot-password-mail.ejs",
        data,
      });

      res.status(200).json({ success: true, message: genericMessage });
    } catch (error: any) {
      user.resetPasswordToken = undefined;
      user.resetPasswordTime = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new ErrorHandler("Failed to send reset email. Please try again.", 500),
      );
    }
  },
);

// @desc       Reset password
// @route      POST /api/reset-password
// @access     public
interface IResetPassword {
  newPassword: string;
}

export const resetPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.query;
    const { newPassword } = req.body as IResetPassword;

    if (!token || typeof token !== "string") {
      return next(new ErrorHandler("Reset token is required", 400));
    }

    if (!newPassword) {
      return next(new ErrorHandler("Please provide a new password", 400));
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

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTime: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid or expired reset token", 400));
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
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully! Now you can login with your new password!",
    });
  },
);
