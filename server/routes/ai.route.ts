import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { generateReminderEmail, getDashboardSummary, parseInvoiceFromText, sendReminderEmail } from "../controllers/ai.controller";

const aiRouter = express.Router();

aiRouter.post("/parse-text", isAuthenticated, parseInvoiceFromText);
aiRouter.post("/generate-reminder", isAuthenticated, generateReminderEmail);
aiRouter.post("/send-reminder-email", isAuthenticated, sendReminderEmail);
aiRouter.get("/dashboard-summary", getDashboardSummary);
export default aiRouter;
