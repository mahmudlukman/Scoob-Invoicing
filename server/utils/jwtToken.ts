import { Response } from "express";
import { IUser } from "../models/User";
import config from "../config";
import crypto from "crypto";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
  domain?: string;
  path?: string;
}

// Parse environment variables
const accessTokenExpire = parseInt(config.JWT_EXPIRES || "15", 10); // minutes
const refreshTokenExpire = parseInt(config.REFRESH_TOKEN_EXPIRES || "7", 10); // days

const isProduction = config.NODE_ENV === "production";
const cookieDomain = config.COOKIE_DOMAIN || undefined;

// Access token options (short-lived)
export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 1000,
  httpOnly: true,
  sameSite: isProduction ? "strict" : "lax",
  secure: isProduction,
  path: "/",
  domain: cookieDomain,
};

// Refresh token options (long-lived)
export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: isProduction ? "strict" : "lax",
  secure: isProduction,
  path: "/",
  domain: cookieDomain,
};

// Send both tokens
export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.getJwtToken();
  const refreshToken = user.getRefreshToken();

  // Set cookies
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

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

// Generate CSRF token
export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
