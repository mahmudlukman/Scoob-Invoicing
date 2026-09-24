import express from "express";
import { isAuthenticated, requireActiveAccount } from "../middleware/auth";
import {
  generateReminderEmail,
  getDashboardSummary,
  parseInvoiceFromText,
  sendReminderEmail,
} from "../controllers/ai.controller";

const aiRouter = express.Router();

aiRouter.use(isAuthenticated, requireActiveAccount);

aiRouter.post("/parse-text", parseInvoiceFromText);
aiRouter.post("/generate-reminder", generateReminderEmail);
aiRouter.post("/send-reminder-email", sendReminderEmail);
aiRouter.get("/dashboard-summary", getDashboardSummary);
export default aiRouter;
