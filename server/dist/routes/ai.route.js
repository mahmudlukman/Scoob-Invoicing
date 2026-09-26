"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const ai_controller_1 = require("../controllers/ai.controller");
const aiRouter = express_1.default.Router();
aiRouter.use(auth_1.isAuthenticated, auth_1.requireActiveAccount);
aiRouter.post("/parse-text", ai_controller_1.parseInvoiceFromText);
aiRouter.post("/generate-reminder", ai_controller_1.generateReminderEmail);
aiRouter.post("/send-reminder-email", ai_controller_1.sendReminderEmail);
aiRouter.get("/dashboard-summary", ai_controller_1.getDashboardSummary);
exports.default = aiRouter;
