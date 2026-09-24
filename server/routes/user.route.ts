import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  getMe,
  updatePassword,
  updateUserStatus,
  updateUserProfile,
  deleteAccount,
  reactivateAccount,
  deactivateAccount,
} from "../controllers/user.controller";
import {
  authorizeRoles,
  isAuthenticated,
  requireActiveAccount,
} from "../middleware/auth";
import { UserRole } from "../models/User";
import {
  adminListLimiter,
  updatePasswordLimiter,
  uploadLimiter,
} from "../utils/rateLimiter";

const userRouter = express.Router();

userRouter.use(isAuthenticated, requireActiveAccount);

userRouter.get("/me", getMe);

userRouter.put("/update-user-password", updatePasswordLimiter, updatePassword);

userRouter.get(
  "/get-user/:id",
  authorizeRoles(UserRole.ADMIN),
  adminListLimiter,
  getUserById,
);

userRouter.get(
  "/get-users",
  authorizeRoles(UserRole.ADMIN),
  adminListLimiter,
  getAllUsers,
);

userRouter.put("/update-user-profile", uploadLimiter, updateUserProfile);

userRouter.put(
  "/update-user-status",
  authorizeRoles(UserRole.ADMIN),
  updateUserStatus,
);

userRouter.delete(
  "/delete-user/:id",
  authorizeRoles(UserRole.ADMIN),
  deleteUser,
);

userRouter.delete("/delete-account", deleteAccount);

userRouter.patch("/deactivate-account", deactivateAccount);

userRouter.patch("/reactivate-account", isAuthenticated, reactivateAccount);

export default userRouter;
