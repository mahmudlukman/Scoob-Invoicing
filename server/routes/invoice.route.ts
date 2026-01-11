import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  createInvoice,
  deleteInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoice,
} from "../controllers/invoice.controller";
const invoiceRouter = express.Router();

invoiceRouter.post("/create-invoice", isAuthenticated, createInvoice);
invoiceRouter.get("/invoices", isAuthenticated, getInvoices);
invoiceRouter.get("/invoice/:id", isAuthenticated, getInvoiceById);
invoiceRouter.put("/update-invoice/:id", isAuthenticated, updateInvoice);
invoiceRouter.delete("/delete-invoice/:id", isAuthenticated, deleteInvoice);

export default invoiceRouter;
