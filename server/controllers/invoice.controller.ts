import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncErrors";
import User from "../models/User";
import ErrorHandler from "../utils/errorHandler";
import Invoice, { IItem } from "../models/Invoice";
import Customer from "../models/Customer";
import {
  computeStatusFromPayments,
  getInvoiceComputedFields,
} from "../utils/invoiceHelper";
import { getCurrencyByCode } from "../utils/currencies";

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

    //  subtotal calculation
    let subtotal = 0;
    let taxTotal = 0;
    items.forEach((item: IItem) => {
      subtotal += item.unitPrice * item.quantity;
      taxTotal +=
        (item.unitPrice * item.quantity * (item.taxPercent || 0)) / 100;
    });

    const total = subtotal + taxTotal;

    const resolvedCurrency = currency?.code
      ? currency
      : getCurrencyByCode(user?.defaultCurrency?.code);

    const invoice = new Invoice({
      user,
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      paymentTerms,
      subtotal,
      taxTotal,
      total,
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

// @desc        Get all invoices of logged-in user
// @route       GET /api/v1/invoices
// @access      Private
export const getInvoices = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user?._id);
    const invoices = await Invoice.find({ user }).populate(
      "user",
      "name email",
    );

    const invoicesWithComputed = invoices.map((invoice) => {
      const computed = getInvoiceComputedFields(invoice);
      return { ...invoice.toObject(), ...computed };
    });

    res.status(200).json({
      success: true,
      invoices: invoicesWithComputed,
    });
  },
);

// @desc        Get single invoices by ID
// @route       GET /api/v1/invoices/:id
// @access      Private
export const getInvoiceById = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const invoice = await Invoice.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!invoice) return next(new ErrorHandler("Invoice not found", 404));

    if (invoice.user._id.toString() !== req.user?._id.toString()) {
      return next(
        new ErrorHandler("Not authorized to access this invoice", 403),
      );
    }

    const computed = getInvoiceComputedFields(invoice);

    res.status(200).json({
      success: true,
      invoice: { ...invoice.toObject(), ...computed },
    });
  },
);
// @desc        Update invoice
// @route       PUT /api/v1/update-invoice/:id
// @access      Private
export const updateInvoice = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
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

    if (invoice.user.toString() !== req.user?._id.toString()) {
      return next(
        new ErrorHandler("Not authorized to update this invoice", 403),
      );
    }

    // Only recalculate totals if items were actually sent
    let totalsUpdate = {};
    if (items && items.length > 0) {
      let subtotal = 0;
      let taxTotal = 0;
      items.forEach((item: IItem) => {
        subtotal += item.unitPrice * item.quantity;
        taxTotal +=
          (item.unitPrice * item.quantity * (item.taxPercent || 0)) / 100;
      });
      const total = subtotal + taxTotal;
      totalsUpdate = { items, subtotal, taxTotal, total };
    }

    // Handle manual status changes from the quick-toggle button (no `items` sent alongside).
    // This keeps `payments` as the source of truth so amountPaid/status never drift apart.
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
        // Reversing to Unpaid only makes sense if there's no real payment history yet.
        // If payments exist, block this — the user should remove individual payments instead.
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

    // Recompute status from actual payment total rather than trusting the raw `status` field,
    // unless it's explicitly "Pending" which is a manual/non-payment-driven state.
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

// @desc        Duplicate an invoice
// @route       POST /api/v1/duplicate-invoice/:id
// @access      Private
export const duplicateInvoice = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const original = await Invoice.findById(req.params.id);

    if (!original) return next(new ErrorHandler("Invoice not found", 404));

    // Find all invoices for this user to determine the next number
    const userInvoices = await Invoice.find({ user: req.user }).select(
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
      user: req.user,
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

// @desc    Update invoice preferences
// @route   PATCH /api/v1/update-invoice-preferences
// @access  Private
export const updateInvoicePreferences = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { templateId, paletteId, colorPalette } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { invoicePreferences: { templateId, paletteId, colorPalette } },
      { new: true },
    );

    if (!user) return next(new ErrorHandler("User not found", 404));

    res
      .status(200)
      .json({ success: true, invoicePreferences: user.invoicePreferences });
  },
);

// @desc        Get income by month for logged-in user (paid invoices only, calendar year)
// @route       GET /api/v1/income-by-month
// @access      Private
export const getIncomeByMonth = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    const now = new Date();
    const currentYear = now.getFullYear();
    const year = Number(req.query.year) || currentYear;

    const startDate = new Date(year, 0, 1); // Jan 1, 00:00
    const endDate = new Date(year + 1, 0, 1); // Jan 1 of next year (exclusive upper bound)

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
    // Past years always show all 12 months (they've fully happened).
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

// @desc        Delete invoice
// @route       DELETE /api/v1/delete-invoice/:id
// @access      Private
export const deleteInvoice = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted successfully" });
  },
);

// @desc        Add a payment to an invoice
// @route       POST /api/v1/invoices/:id/payments
// @access      Private
export const addPayment = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { amount, date, method, note } = req.body;

    if (!amount || amount <= 0) {
      return next(
        new ErrorHandler("Payment amount must be greater than 0", 400),
      );
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return next(new ErrorHandler("Invoice not found", 404));

    if (invoice.user.toString() !== req.user?._id.toString()) {
      return next(
        new ErrorHandler("Not authorized to update this invoice", 403),
      );
    }

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
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return next(new ErrorHandler("Invoice not found", 404));

    if (invoice.user.toString() !== req.user?._id.toString()) {
      return next(
        new ErrorHandler("Not authorized to update this invoice", 403),
      );
    }

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
