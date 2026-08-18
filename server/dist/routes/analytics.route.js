"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const analytics_controller_1 = require("../controllers/analytics.controller");
const User_1 = require("../models/User");
const analyticsRouter = express_1.default.Router();
analyticsRouter.get("/analytics", auth_1.isAuthenticated, auth_1.requireActiveAccount, (0, auth_1.authorizeRoles)(User_1.UserRole.ADMIN), analytics_controller_1.getAnalytics);
exports.default = analyticsRouter;
