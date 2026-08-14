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

userRouter.patch("/update-default-currency", isAuthenticated);

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

userRouter.delete("/delete-account", isAuthenticated, deleteAccount);
userRouter.patch("/deactivate-account", isAuthenticated, deactivateAccount);
userRouter.patch("/reactivate-account", isAuthenticated, reactivateAccount);

export default userRouter;
