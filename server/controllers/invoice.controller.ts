import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { catchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";
import Invoice, { IItem } from "../models/Invoice";
import Customer from "../models/Customer";
import {
  computeStatusFromPayments,
  getInvoiceComputedFields,
} from "../utils/invoiceHelper";
import { getCurrencyByCode } from "../utils/currencies";
import sendMail from "../utils/sendMail";
import { addThousandsSeparator } from "../utils/formatCurrency";
import User from "../models/User";

// --------------------------------------------------
// Shared helpers
// --------------------------------------------------

interface ComputedTotals {
  subtotal: number;
  taxTotal: number;
  total: number;
}

const validateAndComputeTotals = (
  items: IItem[],
  next: NextFunction,
): ComputedTotals | null => {
  if (!Array.isArray(items) || items.length === 0) {
    next(new ErrorHandler("At least one item is required", 400));
    return null;
  }

  let subtotal = 0;
  let taxTotal = 0;

  for (const item of items) {
    const unitPrice = Number(item.unitPrice);
    const quantity = Number(item.quantity);
    const taxPercent =
      item.taxPercent !== undefined ? Number(item.taxPercent) : 0;

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      next(
        new ErrorHandler(
          "Each item must have a valid, non-negative unit price",
          400,
        ),
      );
      return null;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      next(
        new ErrorHandler("Each item must have a quantity greater than 0", 400),
      );
      return null;
    }
    if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
      next(new ErrorHandler("Tax percent must be between 0 and 100", 400));
      return null;
    }

    subtotal += unitPrice * quantity;
    taxTotal += (unitPrice * quantity * taxPercent) / 100;
  }

  return { subtotal, taxTotal, total: subtotal + taxTotal };
};

const resolveCurrency = (
  clientCurrency: { code?: string } | undefined,
  defaultCode: string | undefined,
  next: NextFunction,
) => {
  const codeToResolve = clientCurrency?.code || defaultCode;
  try {
    return getCurrencyByCode(codeToResolve);
  } catch (error) {
    next(new ErrorHandler("Invalid or missing currency code", 400));
    return null;
  }
};

const assertInvoiceOwner = (
  invoiceUserId: mongoose.Types.ObjectId | { toString(): string },
  requestUserId: mongoose.Types.ObjectId | { toString(): string } | undefined,
  next: NextFunction,
  action: "access" | "update",
): boolean => {
  if (invoiceUserId.toString() !== requestUserId?.toString()) {
    next(new ErrorHandler(`Not authorized to ${action} this invoice`, 403));
    return false;
  }
  return true;
};

// --------------------------------------------------
// Create invoice
// --------------------------------------------------

// @desc        Create new Invoice
// @route       POST /api/v1/create-invoice
// @access      Private
export const createInvoice = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      paymentTerms,
      saveCustomer,
      currency,
    } = req.body;

    const totals = validateAndComputeTotals(items, next);
    if (!totals) return;

    const resolvedCurrency = resolveCurrency(
      currency,
      user?.defaultCurrency?.code,
      next,
    );
    if (!resolvedCurrency) return;

    const invoice = new Invoice({
      user: user?._id,
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      paymentTerms,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      total: totals.total,
      currency: resolvedCurrency,
    });

    await invoice.save();

    // Only save/update the customer record if the user opted in
    if (saveCustomer && billTo?.clientName) {
      try {
        if (billTo.email) {
          // Upsert by email so re-checking the box on a repeat client updates their info
          await Customer.findOneAndUpdate(
            { user: user?._id, email: billTo.email },
            {
              user: user?._id,
              clientName: billTo.clientName,
              email: billTo.email,
              address: billTo.address,
              phone: billTo.phone,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true },
          );
        } else {
          // No email to key off of — just create a new customer record
          await Customer.create({
            user: user?._id,
            clientName: billTo.clientName,
            address: billTo.address,
            phone: billTo.phone,
          });
        }
      } catch (err) {
        // Don't fail invoice creation just because customer save had an issue
        console.error("Failed to save customer:", err);
      }
    }

    res.status(201).json(invoice);
  },
);

// --------------------------------------------------
// Get invoices
// --------------------------------------------------

// @desc        Get all invoices of logged-in user
// @route       GET /api/v1/invoices
// @access      Private
export const getInvoices = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(req.query.pageSize as string) || 20),
    );
    const skipAmount = (page - 1) * pageSize;

    const [invoices, totalInvoices] = await Promise.all([
      Invoice.find({ user: req.user?._id })
        .populate("user", "name email")
        .skip(skipAmount)
        .limit(pageSize)
        .sort({ createdAt: -1 }),
      Invoice.countDocuments({ user: req.user?._id }),
    ]);

    const invoicesWithComputed = invoices.map((invoice) => {
      const computed = getInvoiceComputedFields(invoice);
      return { ...invoice.toObject(), ...computed };
    });

    res.status(200).json({
      success: true,
      invoices: invoicesWithComputed,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: totalInvoices,
        totalPages: Math.ceil(totalInvoices / pageSize),
      },
    });
  },
);

// @desc        Get single invoices by ID
// @route       GET /api/v1/invoices/:id
// @access      Private
export const getInvoiceById = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ErrorHandler("Invalid invoice id", 400));
    }

    const invoice = await Invoice.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!invoice) return next(new ErrorHandler("Invoice not found", 404));

    if (!assertInvoiceOwner(invoice.user._id, req.user?._id, next, "access"))
      return;

    const computed = getInvoiceComputedFields(invoice);

    res.status(200).json({
      success: true,
      invoice: { ...invoice.toObject(), ...computed },
    });
  },
);

// --------------------------------------------------
// Update invoice
// --------------------------------------------------

// @desc        Update invoice
// @route       PUT /api/v1/update-invoice/:id
// @access      Private
export const updateInvoice = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ErrorHandler("Invalid invoice id", 400));
    }

    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      paymentTerms,
      status,
    } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    if (!assertInvoiceOwner(invoice.user, req.user?._id, next, "update"))
      return;

    // Only recalculate totals if items were actually sent
    let totalsUpdate = {};
    if (items && items.length > 0) {
      const totals = validateAndComputeTotals(items, next);
      if (!totals) return;
      totalsUpdate = { items, ...totals };
    }

    if (status !== undefined && !items) {
      const currentAmountPaid = invoice.payments.reduce(
        (sum, p) => sum + p.amount,
        0,
      );
      const total = invoice.total || 0;

      if (status === "Paid" && currentAmountPaid < total) {
        // Log the remaining balance as a manual payment so the payment trail stays accurate
        invoice.payments.push({
          amount: total - currentAmountPaid,
          date: new Date(),
          method: "Manual",
          note: "Marked as paid manually",
        });
      } else if (status === "Unpaid") {
        if (invoice.payments.length > 0) {
          return next(
            new ErrorHandler(
              "This invoice has logged payments. Remove individual payments instead of marking it Unpaid directly.",
              400,
            ),
          );
        }
      }
    }

    Object.assign(invoice, {
      ...(invoiceNumber !== undefined && { invoiceNumber }),
      ...(invoiceDate !== undefined && { invoiceDate }),
      ...(dueDate !== undefined && { dueDate }),
      ...(billFrom !== undefined && { billFrom }),
      ...(billTo !== undefined && { billTo }),
      ...(notes !== undefined && { notes }),
      ...(paymentTerms !== undefined && { paymentTerms }),
      ...totalsUpdate,
    });

    const amountPaidAfter = invoice.payments.reduce(
      (sum, p) => sum + p.amount,
      0,
    );
    invoice.status =
      status === "Pending"
        ? "Pending"
        : computeStatusFromPayments(
            invoice.total || 0,
            amountPaidAfter,
            invoice.status,
          );

    await invoice.save();

    const computed = getInvoiceComputedFields(invoice);

    res.status(200).json({
      success: true,
      updatedInvoice: { ...invoice.toObject(), ...computed },
    });
  },
);

// --------------------------------------------------
// Duplicate invoice
// --------------------------------------------------

// @desc        Duplicate an invoice
// @route       POST /api/v1/duplicate-invoice/:id
// @access      Private
export const duplicateInvoice = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ErrorHandler("Invalid invoice id", 400));
    }

    const original = await Invoice.findById(req.params.id);

    if (!original) return next(new ErrorHandler("Invoice not found", 404));

    if (!assertInvoiceOwner(original.user, req.user?._id, next, "access"))
      return;

    // Find all invoices for this user to determine the next number
    const userInvoices = await Invoice.find({ user: req.user?._id }).select(
      "invoiceNumber",
    );

    // Extract numeric parts from all invoice numbers (supports INV-001, INV-12, etc.)
    const maxNumber = userInvoices.reduce((max, inv) => {
      const match = inv.invoiceNumber.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);

    const prefixMatch = original.invoiceNumber.match(/^(.*?)(\d+)$/);
    const prefix = prefixMatch ? prefixMatch[1] : "INV-";

    const originalDigits = prefixMatch ? prefixMatch[2].length : 3;
    const padLength = Math.max(originalDigits, String(maxNumber + 1).length);
    const newInvoiceNumber =
      prefix + String(maxNumber + 1).padStart(padLength, "0");

    const duplicate = new Invoice({
      user: req.user?._id,
      invoiceNumber: newInvoiceNumber,
      invoiceDate: new Date(),
      dueDate: original.dueDate,
      billFrom: original.billFrom,
      billTo: original.billTo,
      items: original.items,
      notes: original.notes,
      paymentTerms: original.paymentTerms,
      subtotal: original.subtotal,
      taxTotal: original.taxTotal,
      total: original.total,
      status: "Unpaid",
    });

    await duplicate.save();

    res.status(201).json({
      success: true,
      invoice: duplicate,
    });
  },
);

// --------------------------------------------------
// Invoice preferences
// --------------------------------------------------

// @desc    Update invoice preferences
// @route   PATCH /api/v1/update-invoice-preferences
// @access  Private
export const updateInvoicePreferences = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { templateId, paletteId, colorPalette } = req.body;

    const updates: Record<string, unknown> = {};
    if (templateId !== undefined)
      updates["invoicePreferences.templateId"] = templateId;

    if (paletteId !== undefined)
      updates["invoicePreferences.paletteId"] = paletteId;

    if (colorPalette !== undefined) {
      if (colorPalette.primary !== undefined) {
        updates["invoicePreferences.colorPalette.primary"] =
          colorPalette.primary;
      }
      if (colorPalette.secondary !== undefined) {
        updates["invoicePreferences.colorPalette.secondary"] =
          colorPalette.secondary;
      }
      if (colorPalette.background !== undefined) {
        updates["invoicePreferences.colorPalette.background"] =
          colorPalette.background;
      }
    }

    if (Object.keys(updates).length === 0) {
      return next(new ErrorHandler("No preferences provided to update", 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!user) return next(new ErrorHandler("User not found", 404));

    res
      .status(200)
      .json({ success: true, invoicePreferences: user.invoicePreferences });
  },
);

// --------------------------------------------------
// Income by month
// --------------------------------------------------

// @desc        Get income by month for logged-in user (paid invoices only, calendar year)
// @route       GET /api/v1/income-by-month
// @access      Private
export const getIncomeByMonth = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    const now = new Date();
    const currentYear = now.getFullYear();
    const year = Number(req.query.year) || currentYear;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const rawIncomeByMonth = await Invoice.aggregate([
      {
        $match: {
          user: user?._id,
          status: "Paid",
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          income: { $sum: "$total" },
          invoiceCount: { $sum: 1 },
        },
      },
    ]);

    // Lookup so we can fill in months with no paid invoices
    const incomeMap = new Map<
      number,
      { income: number; invoiceCount: number }
    >();
    rawIncomeByMonth.forEach((item) => {
      incomeMap.set(item._id.month, {
        income: item.income,
        invoiceCount: item.invoiceCount,
      });
    });

    // If it's the current year, only show up to the current month.
    const monthsToShow = year === currentYear ? now.getMonth() + 1 : 12;

    const incomeByMonth = Array.from({ length: monthsToShow }, (_, i) => {
      const month = i + 1;
      const existing = incomeMap.get(month);
      return {
        _id: { year, month },
        income: existing?.income || 0,
        invoiceCount: existing?.invoiceCount || 0,
      };
    });

    res.status(200).json({
      success: true,
      year,
      incomeByMonth,
    });
  },
);

// --------------------------------------------------
// Delete invoice
// --------------------------------------------------

// @desc        Delete invoice
// @route       DELETE /api/v1/delete-invoice/:id
// @access      Private
export const deleteInvoice = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ErrorHandler("Invalid invoice id", 400));
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    if (!assertInvoiceOwner(invoice.user, req.user?._id, next, "update"))
      return;

    await invoice.deleteOne();

    res.json({ message: "Invoice deleted successfully" });
  },
);

// --------------------------------------------------
// Payments
// --------------------------------------------------

// @desc        Add a payment to an invoice
// @route       POST /api/v1/invoices/:id/payments
// @access      Private
export const addPayment = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ErrorHandler("Invalid invoice id", 400));
    }

    const { amount, date, method, note } = req.body;

    if (!amount || amount <= 0) {
      return next(
        new ErrorHandler("Payment amount must be greater than 0", 400),
      );
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return next(new ErrorHandler("Invoice not found", 404));

    if (!assertInvoiceOwner(invoice.user, req.user?._id, next, "update"))
      return;

    invoice.payments.push({
      amount,
      date: date ? new Date(date) : new Date(),
      method,
      note,
    });

    const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    invoice.status = computeStatusFromPayments(
      invoice.total || 0,
      amountPaid,
      invoice.status,
    );

    await invoice.save();

    const computed = getInvoiceComputedFields(invoice);

    res.status(200).json({
      success: true,
      invoice,
      ...computed,
    });
  },
);

// @desc        Remove a payment from an invoice (e.g. logged in error)
// @route       DELETE /api/v1/invoices/:id/payments/:paymentId
// @access      Private
export const deletePayment = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (
      !mongoose.Types.ObjectId.isValid(req.params.id) ||
      !mongoose.Types.ObjectId.isValid(req.params.paymentId)
    ) {
      return next(new ErrorHandler("Invalid invoice or payment id", 400));
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return next(new ErrorHandler("Invoice not found", 404));

    if (!assertInvoiceOwner(invoice.user, req.user?._id, next, "update"))
      return;

    const paymentExists = invoice.payments.some(
      (p) => p._id?.toString() === req.params.paymentId,
    );
    if (!paymentExists) {
      return next(new ErrorHandler("Payment not found", 404));
    }

    invoice.payments = invoice.payments.filter(
      (p) => p._id?.toString() !== req.params.paymentId,
    ) as typeof invoice.payments;

    const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    invoice.status = computeStatusFromPayments(
      invoice.total || 0,
      amountPaid,
      invoice.status,
    );

    await invoice.save();

    const computed = getInvoiceComputedFields(invoice);

    res.status(200).json({
      success: true,
      invoice,
      ...computed,
    });
  },
);

// --------------------------------------------------
// Receipts
// --------------------------------------------------

// @desc        Send a payment receipt email to the client
// @route       POST /api/v1/invoices/:id/send-receipt
// @access      Private
export const sendReceipt = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ErrorHandler("Invalid invoice id", 400));
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return next(new ErrorHandler("Invoice not found", 404));

    if (!assertInvoiceOwner(invoice.user, req.user?._id, next, "access"))
      return;

    if (invoice.status !== "Paid") {
      return next(
        new ErrorHandler(
          "Receipts can only be sent for fully paid invoices",
          400,
        ),
      );
    }

    const { email } = req.body;
    const recipientEmail = email || invoice.billTo?.email;

    if (!recipientEmail) {
      return next(new ErrorHandler("No recipient email available", 400));
    }

    const currencySymbol = invoice.currency?.symbol || "₦";
    const lastPayment = invoice.payments[invoice.payments.length - 1];

    const paymentDateStr = lastPayment?.date
      ? new Date(lastPayment.date).toLocaleDateString()
      : new Date().toLocaleDateString();

    await sendMail({
      email: recipientEmail,
      subject: `Payment Receipt — Invoice ${invoice.invoiceNumber}`,
      template: "send-receipt.ejs",
      data: {
        clientName: invoice.billTo?.clientName,
        businessName: invoice.billFrom?.businessName,
        invoiceNumber: invoice.invoiceNumber,
        amount: `${currencySymbol}${addThousandsSeparator(invoice.total ?? 0)}`,
        paymentDate: paymentDateStr,
        paymentMethod: lastPayment?.method || "N/A",
      },
    });

    invoice.lastReceiptSentAt = new Date();
    await invoice.save();

    res.status(200).json({
      success: true,
      message: "Receipt sent successfully",
      sentTo: recipientEmail,
    });
  },
);
