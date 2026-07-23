"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const validator_1 = require("../middleware/validator");
const rateLimiter_1 = require("../utils/rateLimiter");
const authRouter = express_1.default.Router();
authRouter.post("/register", rateLimiter_1.registerLimiter, validator_1.validateUserRegistration, validator_1.validate, auth_controller_1.createUser);
authRouter.post("/activate-user", rateLimiter_1.activateLimiter, auth_controller_1.activateUser);
authRouter.post("/login", rateLimiter_1.loginLimiter, validator_1.validateUserLogin, validator_1.validate, auth_controller_1.loginUser);
authRouter.get("/logout", auth_1.isAuthenticated, auth_controller_1.logoutUser);
authRouter.post("/forgot-password", rateLimiter_1.forgotPasswordLimiter, auth_controller_1.forgotPassword);
authRouter.post("/reset-password", rateLimiter_1.resetPasswordLimiter, validator_1.validateChangePassword, validator_1.validate, auth_controller_1.resetPassword);
authRouter.post("/refresh-token", rateLimiter_1.refreshLimiter, auth_controller_1.refreshAccessToken);
exports.default = authRouter;
