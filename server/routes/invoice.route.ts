import express from "express";
import { isAuthenticated, requireActiveAccount } from "../middleware/auth";
import {
  addPayment,
  createInvoice,
  deleteInvoice,
  deletePayment,
  duplicateInvoice,
  getIncomeByMonth,
  getInvoiceById,
  getInvoicePreferences,
  getInvoices,
  sendReceipt,
  updateInvoice,
  updateInvoicePreferences,
} from "../controllers/invoice.controller";
import { invoiceWriteLimiter } from "../utils/rateLimiter";

const invoiceRouter = express.Router();

invoiceRouter.use(isAuthenticated, requireActiveAccount);

invoiceRouter.post("/create-invoice", invoiceWriteLimiter, createInvoice);
invoiceRouter.get("/invoices", getInvoices);
invoiceRouter.get("/invoice/:id", getInvoiceById);
invoiceRouter.put("/update-invoice/:id", invoiceWriteLimiter, updateInvoice);
invoiceRouter.post(
  "/duplicate-invoice/:id",
  invoiceWriteLimiter,
  duplicateInvoice,
);

invoiceRouter.get("/invoice-preferences", getInvoicePreferences);
invoiceRouter.patch(
  "/update-invoice-preferences",
  invoiceWriteLimiter,
  updateInvoicePreferences,
);
invoiceRouter.get("/income-by-month", getIncomeByMonth);

invoiceRouter.delete("/delete-invoice/:id", invoiceWriteLimiter, deleteInvoice);

invoiceRouter.post("/invoices/:id/payments", invoiceWriteLimiter, addPayment);

invoiceRouter.delete(
  "/invoices/:id/payments/:paymentId",
  invoiceWriteLimiter,
  deletePayment,
);
invoiceRouter.post("/send-receipt/:id", sendReceipt);

export default invoiceRouter;
