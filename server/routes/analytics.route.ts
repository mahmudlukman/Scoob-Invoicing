import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { getAnalytics } from "../controllers/analytics.controller";

const analyticsRouter = express.Router();

analyticsRouter.get(
  "/analytics",
  isAuthenticated,
  authorizeRoles("admin"),
  getAnalytics,
);

export default analyticsRouter;
