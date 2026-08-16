"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = exports.sendReminderEmail = exports.generateReminderEmail = exports.parseInvoiceFromText = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const generative_ai_1 = require("@google/generative-ai");
const config_1 = __importDefault(require("../config"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const currencies_1 = require("../utils/currencies");
const formatCurrency_1 = require("../utils/formatCurrency");
const ai = new generative_ai_1.GoogleGenerativeAI(config_1.default.GEMINI_API_KEY);
exports.parseInvoiceFromText = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { text } = req.body;
    if (!text) {
        return next(new errorHandler_1.default("Text is required", 400));
    }
    const userCurrency = (0, currencies_1.getCurrencyByCode)(req.user?.defaultCurrency?.code);
    const prompt = `You are an expert invoice data extraction AI. Analyze the following text and extract the relevant information to create an invoice.
        The output MUST be a valid JSON object.

        Assume all monetary amounts mentioned in the text are in ${userCurrency.name} (${userCurrency.code}), unless the text explicitly states a different currency.
        Extract "unitPrice" as a plain numeric value only — no currency symbols, no commas, no letters. For example, "$1,200.50" or "₦1,200.50" should be extracted as 1200.5.

        The JSON object should have the following structure:
        {
            "clientName": "string",
            "email": "string (if available)",
            "address": "string (if available)",
            "items": [
                {
                    "name": "string",
                    "quantity": "number",
                    "unitPrice": "number",
                }
            ]
        }
            
        Here is the text to parse:
        ---- TEXT START ----
        ${text}
        ---- TEXT END ----
        
        Extract the data and provide only the JSON object.`;
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    let responseText = result.response.text;
    if (typeof responseText === "function") {
        responseText = result.response.text();
    }
    if (typeof responseText !== "string") {
        throw new Error("Could not extract text from AI response.");
    }
    const cleanedJson = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
    const parsedData = JSON.parse(cleanedJson);
    // Defensive sanitation — strip any currency symbols/commas the AI might
    // still slip into a numeric field, and coerce to a real number.
    const sanitizeAmount = (value) => {
        if (typeof value === "number")
            return value;
        if (typeof value === "string") {
            const cleaned = value.replace(/[^0-9.-]/g, "");
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };
    if (Array.isArray(parsedData.items)) {
        parsedData.items = parsedData.items.map((item) => ({
            ...item,
            unitPrice: sanitizeAmount(item.unitPrice),
            quantity: typeof item.quantity === "number"
                ? item.quantity
                : sanitizeAmount(item.quantity) || 1,
        }));
    }
    // Let the frontend know which currency these amounts were interpreted in,
    // so CreateInvoice's currency selector can default to it rather than NGN.
    res.status(200).json({
        ...parsedData,
        currency: { code: userCurrency.code, symbol: userCurrency.symbol },
    });
});
exports.generateReminderEmail = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { invoiceId } = req.body;
    if (!invoiceId) {
        return res.status(400).json({ message: "Invoice ID is required" });
    }
    const invoice = await Invoice_1.default.findById(invoiceId);
    if (!invoice) {
        return next(new errorHandler_1.default("Invoice not found", 400));
    }
    const dueDateStr = invoice.dueDate
        ? new Date(invoice.dueDate).toLocaleDateString()
        : "N/A";
    const currencySymbol = invoice.currency?.symbol || "₦";
    const amountDueStr = `${currencySymbol}${(0, formatCurrency_1.addThousandsSeparator)(invoice.total ?? 0)}`;
    const prompt = ` You are a professional and polite accounting assistant. Write a friendly reminder email to a client about an overdue or upcoming invoice payment.
        
        Use the following details to personalize the email:
        - Client Name: ${invoice.billTo.clientName}
        - Invoice Number: ${invoice.invoiceNumber}
        - Amount Due: ${amountDueStr}
        - Due Date: ${dueDateStr}
        
        The tone should be friendly but clear. Keep it concise. Start the email with "Subject: ".`;
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    res.status(200).json({ reminderText: result.response.text() });
});
// Send the reminder email (separate endpoint for actual sending)
exports.sendReminderEmail = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { invoiceId, subject, body } = req.body;
    if (!invoiceId || !subject || !body) {
        return next(new errorHandler_1.default("Invoice ID, subject, and body are required", 400));
    }
    const invoice = await Invoice_1.default.findById(invoiceId);
    if (!invoice) {
        return next(new errorHandler_1.default("Invoice not found", 404));
    }
    // Validate client email exists
    if (!invoice.billTo.email) {
        return next(new errorHandler_1.default("Client email not found in invoice", 400));
    }
    const dueDateStr = invoice.dueDate
        ? new Date(invoice.dueDate).toLocaleDateString()
        : "N/A";
    // Send email using your sendMail utility
    await (0, sendMail_1.default)({
        email: invoice.billTo.email,
        subject: subject,
        template: "invoice-reminder.ejs",
        data: {
            clientName: invoice.billTo.clientName,
            invoiceNumber: invoice.invoiceNumber,
            amount: (invoice.total ?? 0).toFixed(2),
            dueDate: dueDateStr,
            emailBody: body,
        },
    });
    res.status(200).json({
        success: true,
        message: "Reminder email sent successfully",
        sentTo: invoice.billTo.email,
    });
});
exports.getDashboardSummary = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const user = req.user?._id;
    const invoices = await Invoice_1.default.find({ user });
    if (invoices.length === 0) {
        return res.status(200).json({
            insights: ["No invoice data available to generate insights."],
        });
    }
    // Process and summarize data
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((inv) => inv.status === "Paid");
    const unpaidInvoices = invoices.filter((inv) => inv.status !== "Paid");
    const totalRevenue = paidInvoices.reduce((acc, inv) => acc + (inv.total ?? 0), 0);
    const totalOutStanding = unpaidInvoices.reduce((acc, inv) => acc + (inv.total ?? 0), 0);
    const dataSummary = `
        - Total number of invoices: ${totalInvoices}
        - Total paid invoices: ${paidInvoices.length}
        - Total unpaid/pending invoices: ${unpaidInvoices.length}
        - Total revenue from paid invoices: ${totalRevenue.toFixed(2)}
        - Total outstanding amount from unpaid/pending invoices: ${totalOutStanding.toFixed(2)}
        - Recent invoices (last 5): ${invoices
        .slice(0, 5)
        .map((inv) => `Invoice #${inv.invoiceNumber} for ${(inv.total ?? 0).toFixed(2)} with status ${inv.status}`)
        .join(", ")}`;
    const prompt = `You are a friendly and insightful financial analyst for a small business owner.
        Based on the following summary of their invoice data, provide 2-3 concise and actionable insights.
        Each insight should be a short string in a JSON array.
        The insights should be encouraging and helpful. Do not just repeat the data.
        For example, if there is a high outstanding amount, suggest sending reminders. If revenue is high, be encouraging.
        
        Data Summary:
        ${dataSummary}
        
        Return your response as a valid JSON object with a single key "insights" which is an array object string.
        Example format: {"insights": ["Your revenue is looking strong this month!", "You have 5 overdue invoices. Consider sending reminders to get paid faster."]}`;
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedJson = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
    const parsedData = JSON.parse(cleanedJson);
    res.status(200).json(parsedData);
});
