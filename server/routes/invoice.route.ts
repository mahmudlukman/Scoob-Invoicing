import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  createInvoice,
  deleteInvoice,
  duplicateInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoice,
  updateInvoicePreferences,
} from "../controllers/invoice.controller";
import { invoiceWriteLimiter } from "../utils/rateLimiter";
const invoiceRouter = express.Router();

invoiceRouter.post(
  "/create-invoice",
  isAuthenticated,
  invoiceWriteLimiter,
  createInvoice,
);
invoiceRouter.get("/invoices", isAuthenticated, getInvoices);
invoiceRouter.get("/invoice/:id", isAuthenticated, getInvoiceById);
invoiceRouter.put(
  "/update-invoice/:id",
  isAuthenticated,
  invoiceWriteLimiter,
  updateInvoice,
);
invoiceRouter.post(
  "/duplicate-invoice/:id",
  isAuthenticated,
  invoiceWriteLimiter,
  duplicateInvoice,
);
invoiceRouter.patch(
  "/update-invoice-preferences",
  isAuthenticated,
  invoiceWriteLimiter,
  updateInvoicePreferences,
);
invoiceRouter.delete(
  "/delete-invoice/:id",
  isAuthenticated,
  invoiceWriteLimiter,
  deleteInvoice,
);

export default invoiceRouter;
