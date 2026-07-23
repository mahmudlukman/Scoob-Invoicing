"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const invoice_controller_1 = require("../controllers/invoice.controller");
const rateLimiter_1 = require("../utils/rateLimiter");
const invoiceRouter = express_1.default.Router();
invoiceRouter.post("/create-invoice", auth_1.isAuthenticated, rateLimiter_1.invoiceWriteLimiter, invoice_controller_1.createInvoice);
invoiceRouter.get("/invoices", auth_1.isAuthenticated, invoice_controller_1.getInvoices);
invoiceRouter.get("/invoice/:id", auth_1.isAuthenticated, invoice_controller_1.getInvoiceById);
invoiceRouter.put("/update-invoice/:id", auth_1.isAuthenticated, rateLimiter_1.invoiceWriteLimiter, invoice_controller_1.updateInvoice);
invoiceRouter.post("/duplicate-invoice/:id", auth_1.isAuthenticated, rateLimiter_1.invoiceWriteLimiter, invoice_controller_1.duplicateInvoice);
invoiceRouter.patch("/update-invoice-preferences", auth_1.isAuthenticated, rateLimiter_1.invoiceWriteLimiter, invoice_controller_1.updateInvoicePreferences);
invoiceRouter.delete("/delete-invoice/:id", auth_1.isAuthenticated, rateLimiter_1.invoiceWriteLimiter, invoice_controller_1.deleteInvoice);
exports.default = invoiceRouter;
