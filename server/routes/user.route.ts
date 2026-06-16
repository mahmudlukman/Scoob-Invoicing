import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  getMe,
  updatePassword,
  updateUserStatus,
  updateUserProfile,
} from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  adminListLimiter,
  updatePasswordLimiter,
  uploadLimiter,
} from "../utils/rateLimiter";

const userRouter = express.Router();

userRouter.get("/me", isAuthenticated, getMe);
userRouter.put(
  "/update-user-password",
  isAuthenticated,
  updatePasswordLimiter,
  updatePassword,
);
userRouter.get("/get-user/:id", getUserById);
userRouter.get(
  "/get-users",
  isAuthenticated,
  authorizeRoles("admin"),
  adminListLimiter,
  getAllUsers,
);
userRouter.put(
  "/update-user-profile",
  isAuthenticated,
  uploadLimiter,
  updateUserProfile,
);
userRouter.put(
  "/update-user-status",
  isAuthenticated,
  authorizeRoles("admin"),
  updateUserStatus,
);

userRouter.delete(
  "/delete-user/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteUser,
);

export default userRouter;
