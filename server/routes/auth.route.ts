import express from "express";
import {
  activateUser,
  forgotPassword,
  loginUser,
  logoutUser,
  resetPassword,
  createUser,
  refreshAccessToken,
  resendActivationOtp,
} from "../controllers/auth.controller";
import { isAuthenticated } from "../middleware/auth";
import {
  validate,
  validateChangePassword,
  validateUserLogin,
  validateUserRegistration,
} from "../middleware/validator";
import {
  activateLimiter,
  forgotPasswordLimiter,
  loginLimiter,
  refreshLimiter,
  registerLimiter,
  resendActivationLimiter,
  resetPasswordLimiter,
} from "../utils/rateLimiter";
const authRouter = express.Router();

authRouter.post(
  "/register",
  registerLimiter,
  validateUserRegistration,
  validate,
  createUser,
);
authRouter.post("/activate-user", activateLimiter, activateUser);
authRouter.post(
  "/resend-activation",
  resendActivationLimiter,
  resendActivationOtp,
);
authRouter.post("/login", loginLimiter, validateUserLogin, validate, loginUser);
authRouter.get("/logout", isAuthenticated, logoutUser);
authRouter.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
authRouter.post(
  "/reset-password",
  resetPasswordLimiter,
  validateChangePassword,
  validate,
  resetPassword,
);
authRouter.post("/refresh-token", refreshLimiter, refreshAccessToken);

export default authRouter;
