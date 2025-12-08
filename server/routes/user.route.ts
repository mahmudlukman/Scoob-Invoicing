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

const userRouter = express.Router();

userRouter.get("/me", isAuthenticated, getMe);
userRouter.put("/update-user-password", isAuthenticated, updatePassword);
userRouter.get("/get-user/:id", getUserById);
userRouter.get(
  "/get-users",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllUsers
);
userRouter.put(
  "/update-user-profile",
  isAuthenticated,
  updateUserProfile
);
userRouter.put(
  "/update-user-status",
  isAuthenticated,
  authorizeRoles("admin"),
  updateUserStatus
);

userRouter.delete(
  "/delete-user/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteUser
);

export default userRouter;
