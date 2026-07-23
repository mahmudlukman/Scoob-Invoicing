import { Request, Response, NextFunction } from "express";
import * as crypto from "crypto";
import ErrorHandler from "../utils/errorHandler";
import config from "../config";

export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Skip in development
  if (config.NODE_ENV !== "production") {
    return next();
  }

  const csrfToken = req.headers["x-csrf-token"] || req.body._csrf;

  if (!csrfToken) {
    return next(new ErrorHandler("CSRF token missing", 403));
  }

  // Validate CSRF token from cookie
  const cookieToken = req.cookies["csrf_token"];

  if (!cookieToken || csrfToken !== cookieToken) {
    return next(new ErrorHandler("Invalid CSRF token", 403));
  }

  next();
};

// Generate CSRF token middleware
export const generateCSRFToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.cookies["csrf_token"]) {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie("csrf_token", token, {
      httpOnly: false, // Must be accessible by JavaScript
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }
  next();
};
