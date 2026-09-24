import express from "express";
import {
  authorizeRoles,
  isAuthenticated,
  requireActiveAccount,
} from "../middleware/auth";
import { getAnalytics } from "../controllers/analytics.controller";
import { UserRole } from "../models/User";

const analyticsRouter = express.Router();

analyticsRouter.use(isAuthenticated, requireActiveAccount);

analyticsRouter.get("/analytics", authorizeRoles(UserRole.ADMIN), getAnalytics);

export default analyticsRouter;
