"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendReceipt = exports.deletePayment = exports.addPayment = exports.deleteInvoice = exports.getIncomeByMonth = exports.updateInvoicePreferences = exports.duplicateInvoice = exports.updateInvoice = exports.getInvoiceById = exports.getInvoices = exports.createInvoice = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
const Customer_1 = __importDefault(require("../models/Customer"));
const invoiceHelper_1 = require("../utils/invoiceHelper");
const currencies_1 = require("../utils/currencies");
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const formatCurrency_1 = require("../utils/formatCurrency");
const User_1 = __importDefault(require("../models/User"));
const ALLOWED_MANUAL_STATUSES = ["Paid", "Unpaid", "Pending"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validateAndComputeTotals = (items, next) => {
    if (!Array.isArray(items) || items.length === 0) {
        next(new errorHandler_1.default("At least one item is required", 400));
        return null;
    }
    let subtotal = 0;
    let taxTotal = 0;
    for (const item of items) {
        const unitPrice = Number(item.unitPrice);
        const quantity = Number(item.quantity);
        const taxPercent = item.taxPercent !== undefined ? Number(item.taxPercent) : 0;
        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
            next(new errorHandler_1.default("Each item must have a valid, non-negative unit price", 400));
            return null;
        }
        if (!Number.isFinite(quantity) || quantity <= 0) {
            next(new errorHandler_1.default("Each item must have a quantity greater than 0", 400));
            return null;
        }
        if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
            next(new errorHandler_1.default("Tax percent must be between 0 and 100", 400));
            return null;
        }
        subtotal += unitPrice * quantity;
        taxTotal += (unitPrice * quantity * taxPercent) / 100;
    }
    return { subtotal, taxTotal, total: subtotal + taxTotal };
};
const resolveCurrency = (clientCurrency, defaultCode, next) => {
    const codeToResolve = clientCurrency?.code || defaultCode;
    try {
        return (0, currencies_1.getCurrencyByCode)(codeToResolve);
    }
    catch (error) {
        next(new errorHandler_1.default("Invalid or missing currency code", 400));
        return null;
    }
};
const assertInvoiceOwner = (invoiceUserId, requestUserId, next, action) => {
    if (invoiceUserId.toString() !== requestUserId?.toString()) {
        next(new errorHandler_1.default(`Not authorized to ${action} this invoice`, 403));
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
exports.createInvoice = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const user = req.user;
    const { invoiceNumber, invoiceDate, dueDate, billFrom, billTo, items, notes, paymentTerms, saveCustomer, currency, } = req.body;
    const totals = validateAndComputeTotals(items, next);
    if (!totals)
        return;
    const resolvedCurrency = resolveCurrency(currency, user?.defaultCurrency?.code, next);
    if (!resolvedCurrency)
        return;
    const invoice = new Invoice_1.default({
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
    try {
        await invoice.save();
    }
    catch (err) {
        // Surface duplicate invoiceNumber as a clean 400 instead of a raw 500
        if (err?.code === 11000) {
            return next(new errorHandler_1.default("An invoice with this number already exists", 400));
        }
        throw err;
    }
    // Only save/update the customer record if the user opted in
    if (saveCustomer && billTo?.clientName) {
        try {
            if (billTo.email) {
                // Upsert by email so re-checking the box on a repeat client updates their info
                await Customer_1.default.findOneAndUpdate({ user: user?._id, email: billTo.email }, {
                    user: user?._id,
                    clientName: billTo.clientName,
                    email: billTo.email,
                    address: billTo.address,
                    phone: billTo.phone,
                }, { upsert: true, new: true, setDefaultsOnInsert: true });
            }
            else {
                // No email to key off of — just create a new customer record
                await Customer_1.default.create({
                    user: user?._id,
                    clientName: billTo.clientName,
                    address: billTo.address,
                    phone: billTo.phone,
                });
            }
        }
        catch (err) {
            // Don't fail invoice creation just because customer save had an issue
            console.error("Failed to save customer:", err);
        }
    }
    res.status(201).json(invoice);
});
// --------------------------------------------------
// Get invoices
// --------------------------------------------------
// @desc        Get all invoices of logged-in user
// @route       GET /api/v1/invoices
// @access      Private
exports.getInvoices = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));
    const skipAmount = (page - 1) * pageSize;
    const [invoices, totalInvoices] = await Promise.all([
        Invoice_1.default.find({ user: req.user?._id })
            .populate("user", "name email")
            .skip(skipAmount)
            .limit(pageSize)
            .sort({ createdAt: -1 }),
        Invoice_1.default.countDocuments({ user: req.user?._id }),
    ]);
    const invoicesWithComputed = invoices.map((invoice) => {
        const computed = (0, invoiceHelper_1.getInvoiceComputedFields)(invoice);
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
});
// @desc        Get single invoices by ID
// @route       GET /api/v1/invoices/:id
// @access      Private
exports.getInvoiceById = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
        return next(new errorHandler_1.default("Invalid invoice id", 400));
    }
    const invoice = await Invoice_1.default.findById(req.params.id).populate("user", "name email");
    if (!invoice)
        return next(new errorHandler_1.default("Invoice not found", 404));
    if (!assertInvoiceOwner(invoice.user._id, req.user?._id, next, "access"))
        return;
    const computed = (0, invoiceHelper_1.getInvoiceComputedFields)(invoice);
    res.status(200).json({
        success: true,
        invoice: { ...invoice.toObject(), ...computed },
    });
});
// --------------------------------------------------
// Update invoice
// --------------------------------------------------
// @desc        Update invoice
// @route       PUT /api/v1/update-invoice/:id
// @access      Private
exports.updateInvoice = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
        return next(new errorHandler_1.default("Invalid invoice id", 400));
    }
    const { invoiceNumber, invoiceDate, dueDate, billFrom, billTo, items, notes, paymentTerms, status, } = req.body;
    if (status !== undefined && !ALLOWED_MANUAL_STATUSES.includes(status)) {
        return next(new errorHandler_1.default(`Status must be one of: ${ALLOWED_MANUAL_STATUSES.join(", ")}`, 400));
    }
    const invoice = await Invoice_1.default.findById(req.params.id);
    if (!invoice)
        return next(new errorHandler_1.default("Invoice not found", 404));
    if (!assertInvoiceOwner(invoice.user, req.user?._id, next, "update"))
        return;
    // Only recalculate totals if items were actually sent
    let totalsUpdate = {};
    if (items && items.length > 0) {
        const totals = validateAndComputeTotals(items, next);
        if (!totals)
            return;
        totalsUpdate = { items, ...totals };
    }
    // Apply field + totals updates FIRST, so any status logic below sees the
    // up-to-date total rather than a stale one. Previously this ran before
    // the totals were applied when items were included, which could leave
    // a "Paid" request as "Partial" after new items changed the total.
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
    // Status handling now runs whenever `status` is present, regardless of
    // whether `items` was also sent — previously this whole block was
    // skipped if items were included, which let the "can't mark Unpaid
    // with existing payments" guard be bypassed just by sending items too.
    if (status !== undefined) {
        const currentAmountPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
        const total = invoice.total || 0;
        if (status === "Paid" && currentAmountPaid < total) {
            // Log the remaining balance as a manual payment so the payment trail stays accurate
            invoice.payments.push({
                amount: total - currentAmountPaid,
                date: new Date(),
                method: "Manual",
                note: "Marked as paid manually",
            });
        }
        else if (status === "Unpaid") {
            if (invoice.payments.length > 0) {
                return next(new errorHandler_1.default("This invoice has logged payments. Remove individual payments instead of marking it Unpaid directly.", 400));
            }
        }
    }
    const amountPaidAfter = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    invoice.status =
        status === "Pending"
            ? "Pending"
            : (0, invoiceHelper_1.computeStatusFromPayments)(invoice.total || 0, amountPaidAfter, invoice.status);
    try {
        await invoice.save();
    }
    catch (err) {
        if (err?.code === 11000) {
            return next(new errorHandler_1.default("An invoice with this number already exists", 400));
        }
        throw err;
    }
    const computed = (0, invoiceHelper_1.getInvoiceComputedFields)(invoice);
    res.status(200).json({
        success: true,
        updatedInvoice: { ...invoice.toObject(), ...computed },
    });
});
// --------------------------------------------------
// Duplicate invoice
// --------------------------------------------------
// @desc        Duplicate an invoice
// @route       POST /api/v1/duplicate-invoice/:id
// @access      Private
exports.duplicateInvoice = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
        return next(new errorHandler_1.default("Invalid invoice id", 400));
    }
    const original = await Invoice_1.default.findById(req.params.id);
    if (!original)
        return next(new errorHandler_1.default("Invoice not found", 404));
    if (!assertInvoiceOwner(original.user, req.user?._id, next, "access"))
        return;
    // Find all invoices for this user to determine the next number
    const userInvoices = await Invoice_1.default.find({ user: req.user?._id }).select("invoiceNumber");
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
    const newInvoiceNumber = prefix + String(maxNumber + 1).padStart(padLength, "0");
    // NOTE: computing the next number this way (max + 1) has a race condition
    // if two duplicate/create requests land concurrently for the same user —
    // both can compute the same number. A proper fix needs an atomic
    // per-user counter (e.g. a Counter collection + findOneAndUpdate with
    // $inc), which is a bigger change than a one-line patch, so it's left
    // as a known limitation here rather than guessed at.
    const duplicate = new Invoice_1.default({
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
        currency: original.currency, // was previously missing — duplicates fell back to default currency
        status: "Unpaid",
    });
    try {
        await duplicate.save();
    }
    catch (err) {
        if (err?.code === 11000) {
            return next(new errorHandler_1.default("Could not generate a unique invoice number, please try again", 409));
        }
        throw err;
    }
    res.status(201).json({
        success: true,
        invoice: duplicate,
    });
});
// --------------------------------------------------
// Invoice preferences
// --------------------------------------------------
// @desc    Update invoice preferences
// @route   PATCH /api/v1/update-invoice-preferences
// @access  Private
exports.updateInvoicePreferences = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { templateId, paletteId, colorPalette } = req.body;
    const updates = {};
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
        return next(new errorHandler_1.default("No preferences provided to update", 400));
    }
    const user = await User_1.default.findByIdAndUpdate(req.user?._id, { $set: updates }, { new: true, runValidators: true });
    if (!user)
        return next(new errorHandler_1.default("User not found", 404));
    res
        .status(200)
        .json({ success: true, invoicePreferences: user.invoicePreferences });
});
// --------------------------------------------------
// Income by month
// --------------------------------------------------
// @desc        Get income by month for logged-in user (paid invoices only, calendar year)
// @route       GET /api/v1/income-by-month
// @access      Private
exports.getIncomeByMonth = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const user = req.user;
    const now = new Date();
    const currentYear = now.getFullYear();
    const year = Number(req.query.year) || currentYear;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);
    // NOTE: this groups by `createdAt` (when the invoice was created), not
    // by when it was actually paid. An invoice created in January but paid
    // in March currently shows as January income. If cash-basis reporting
    // is the intent, this needs a `paidAt` field set when status flips to
    // "Paid" (or the last payment's date) to group on instead — left
    // unchanged here since that's a schema/product decision, not a bug fix.
    const rawIncomeByMonth = await Invoice_1.default.aggregate([
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
    const incomeMap = new Map();
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
});
// --------------------------------------------------
// Delete invoice
// --------------------------------------------------
// @desc        Delete invoice
// @route       DELETE /api/v1/delete-invoice/:id
// @access      Private
exports.deleteInvoice = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
        return next(new errorHandler_1.default("Invalid invoice id", 400));
    }
    const invoice = await Invoice_1.default.findById(req.params.id);
    if (!invoice)
        return next(new errorHandler_1.default("Invoice not found", 404));
    if (!assertInvoiceOwner(invoice.user, req.user?._id, next, "update"))
        return;
    await invoice.deleteOne();
    res
        .status(200)
        .json({ success: true, message: "Invoice deleted successfully" });
});
// --------------------------------------------------
// Payments
// --------------------------------------------------
// @desc        Add a payment to an invoice
// @route       POST /api/v1/invoices/:id/payments
// @access      Private
exports.addPayment = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
        return next(new errorHandler_1.default("Invalid invoice id", 400));
    }
    const { amount, date, method, note } = req.body;
    if (!amount || amount <= 0) {
        return next(new errorHandler_1.default("Payment amount must be greater than 0", 400));
    }
    let paymentDate = new Date();
    if (date !== undefined) {
        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) {
            return next(new errorHandler_1.default("Invalid payment date", 400));
        }
        paymentDate = parsed;
    }
    const invoice = await Invoice_1.default.findById(req.params.id);
    if (!invoice)
        return next(new errorHandler_1.default("Invoice not found", 404));
    if (!assertInvoiceOwner(invoice.user, req.user?._id, next, "update"))
        return;
    invoice.payments.push({
        amount,
        date: paymentDate,
        method,
        note,
    });
    const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    invoice.status = (0, invoiceHelper_1.computeStatusFromPayments)(invoice.total || 0, amountPaid, invoice.status);
    await invoice.save();
    const computed = (0, invoiceHelper_1.getInvoiceComputedFields)(invoice);
    res.status(200).json({
        success: true,
        invoice,
        ...computed,
    });
});
// @desc        Remove a payment from an invoice (e.g. logged in error)
// @route       DELETE /api/v1/invoices/:id/payments/:paymentId
// @access      Private
exports.deletePayment = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id) ||
        !mongoose_1.default.Types.ObjectId.isValid(req.params.paymentId)) {
        return next(new errorHandler_1.default("Invalid invoice or payment id", 400));
    }
    const invoice = await Invoice_1.default.findById(req.params.id);
    if (!invoice)
        return next(new errorHandler_1.default("Invoice not found", 404));
    if (!assertInvoiceOwner(invoice.user, req.user?._id, next, "update"))
        return;
    const paymentExists = invoice.payments.some((p) => p._id?.toString() === req.params.paymentId);
    if (!paymentExists) {
        return next(new errorHandler_1.default("Payment not found", 404));
    }
    invoice.payments = invoice.payments.filter((p) => p._id?.toString() !== req.params.paymentId);
    const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    invoice.status = (0, invoiceHelper_1.computeStatusFromPayments)(invoice.total || 0, amountPaid, invoice.status);
    await invoice.save();
    const computed = (0, invoiceHelper_1.getInvoiceComputedFields)(invoice);
    res.status(200).json({
        success: true,
        invoice,
        ...computed,
    });
});
// --------------------------------------------------
// Receipts
// --------------------------------------------------
// @desc        Send a payment receipt email to the client
// @route       POST /api/v1/invoices/:id/send-receipt
// @access      Private
exports.sendReceipt = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
        return next(new errorHandler_1.default("Invalid invoice id", 400));
    }
    const invoice = await Invoice_1.default.findById(req.params.id);
    if (!invoice)
        return next(new errorHandler_1.default("Invoice not found", 404));
    if (!assertInvoiceOwner(invoice.user, req.user?._id, next, "access"))
        return;
    if (invoice.status !== "Paid") {
        return next(new errorHandler_1.default("Receipts can only be sent for fully paid invoices", 400));
    }
    const { email } = req.body;
    const recipientEmail = email || invoice.billTo?.email;
    if (!recipientEmail) {
        return next(new errorHandler_1.default("No recipient email available", 400));
    }
    if (!EMAIL_REGEX.test(recipientEmail)) {
        return next(new errorHandler_1.default("Invalid recipient email", 400));
    }
    const currencySymbol = invoice.currency?.symbol || "₦";
    const lastPayment = invoice.payments[invoice.payments.length - 1];
    const paymentDateStr = lastPayment?.date
        ? new Date(lastPayment.date).toLocaleDateString()
        : new Date().toLocaleDateString();
    await (0, sendMail_1.default)({
        email: recipientEmail,
        subject: `Payment Receipt — Invoice ${invoice.invoiceNumber}`,
        template: "send-receipt.ejs",
        data: {
            clientName: invoice.billTo?.clientName,
            businessName: invoice.billFrom?.businessName,
            invoiceNumber: invoice.invoiceNumber,
            amount: `${currencySymbol}${(0, formatCurrency_1.addThousandsSeparator)(invoice.total ?? 0)}`,
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
});
