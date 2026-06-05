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
const invoiceRouter = express.Router();

invoiceRouter.post("/create-invoice", isAuthenticated, createInvoice);
invoiceRouter.get("/invoices", isAuthenticated, getInvoices);
invoiceRouter.get("/invoice/:id", isAuthenticated, getInvoiceById);
invoiceRouter.put("/update-invoice/:id", isAuthenticated, updateInvoice);
invoiceRouter.post("/duplicate-invoice/:id", isAuthenticated, duplicateInvoice);
invoiceRouter.patch(
  "/update-invoice-preferences",
  isAuthenticated,
  updateInvoicePreferences,
);
invoiceRouter.delete("/delete-invoice/:id", isAuthenticated, deleteInvoice);

export default invoiceRouter;
