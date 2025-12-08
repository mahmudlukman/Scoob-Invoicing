import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";
import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config";
import Invoice from "../models/Invoice";
import sendMail from "../utils/sendMail";

const ai = new GoogleGenerativeAI(config.GEMINI_API_KEY);

export const parseInvoiceFromText = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { text } = req.body;

    if (!text) {
      return next(new ErrorHandler("Text is required", 400));
    }
    const prompt = `You are an expert invoice data extraction AI. Analyze the following text and extract the relevant information to create an invoice.
        The output MUST be a valid JSON object.
        
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

    let responseText: any = result.response.text;
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

    res.status(200).json(parsedData);
  }
);

export const generateReminderEmail = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ message: "Invoice ID is required" });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return next(new ErrorHandler("Invoice not found", 400));
    }

    const dueDateStr = invoice.dueDate
      ? new Date(invoice.dueDate).toLocaleDateString()
      : "N/A";

    const prompt = ` You are a professional and polite accounting assistant. Write a friendly reminder email to a client about an overdue or upcoming invoice payment.
        
        Use the following details to personalize the email:
        - Client Name: ${invoice.billTo.clientName}
        - Invoice Number: ${invoice.invoiceNumber}
        - Amount Due: ${(invoice.total ?? 0).toFixed(2)}
        - Due Date: ${dueDateStr}
        
        The tone should be friendly but clear. Keep it concise. Start the email with "Subject: ".`;

    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);

    res.status(200).json({ reminderText: result.response.text() });
  }
);

// Send the reminder email (separate endpoint for actual sending)
export const sendReminderEmail = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { invoiceId, subject, body } = req.body;

    if (!invoiceId || !subject || !body) {
      return next(new ErrorHandler("Invoice ID, subject, and body are required", 400));
    }

    const invoice = await Invoice.findById(invoiceId);
    
    if (!invoice) {
      return next(new ErrorHandler("Invoice not found", 404));
    }

    // Validate client email exists
    if (!invoice.billTo.email) {
      return next(new ErrorHandler("Client email not found in invoice", 400));
    }

    const dueDateStr = invoice.dueDate
      ? new Date(invoice.dueDate).toLocaleDateString()
      : "N/A";

    // Send email using your sendMail utility
    await sendMail({
      email: invoice.billTo.email,
      subject: subject,
      template: "reminder-email.ejs",
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
      sentTo: invoice.billTo.email
    });
  }
);

export const getDashboardSummary = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user?._id;
    const invoices = await Invoice.find({ user });

    if (invoices.length === 0) {
      return res.status(200).json({
        insights: ["No invoice data available to generate insights."],
      });
    }

    // Process and summarize data
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((inv) => inv.status === "Paid");
    const unpaidInvoices = invoices.filter((inv) => inv.status !== "Paid");
    const totalRevenue = paidInvoices.reduce(
      (acc, inv) => acc + (inv.total ?? 0),
      0
    );
    const totalOutStanding = unpaidInvoices.reduce(
      (acc, inv) => acc + (inv.total ?? 0),
      0
    );

    const dataSummary = `
        - Total number of invoices: ${totalInvoices}
        - Total paid invoices: ${paidInvoices.length}
        - Total unpaid/pending invoices: ${unpaidInvoices.length}
        - Total revenue from paid invoices: ${totalRevenue.toFixed(2)}
        - Total outstanding amount from unpaid/pending invoices: ${totalOutStanding.toFixed(
          2
        )}
        - Recent invoices (last 5): ${invoices
          .slice(0, 5)
          .map(
            (inv) =>
              `Invoice #${inv.invoiceNumber} for ${(inv.total ?? 0).toFixed(
                2
              )} with status ${inv.status}`
          )
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
  }
);
