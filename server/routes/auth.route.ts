import express from "express";
import {
  activateUser,
  forgotPassword,
  loginUser,
  logoutUser,
  resetPassword,
  createUser,
  refreshAccessToken,
} from "../controllers/auth.controller";
import { isAuthenticated } from "../middleware/auth";
import {
  validate,
  validateChangePassword,
  validateUserLogin,
  validateUserRegistration,
} from "../middleware/validator";
const authRouter = express.Router();

authRouter.post("/register", validateUserRegistration, validate, createUser);
authRouter.post("/activate-user", activateUser);
authRouter.post("/login", validateUserLogin, validate, loginUser);
authRouter.get("/logout", isAuthenticated, logoutUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post(
  "/reset-password",
  validateChangePassword,
  validate,
  resetPassword
);
authRouter.post("/refresh-token", refreshAccessToken);

export default authRouter;
