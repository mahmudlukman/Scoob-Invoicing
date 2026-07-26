"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInvoice = exports.getIncomeByMonth = exports.updateInvoicePreferences = exports.duplicateInvoice = exports.updateInvoice = exports.getInvoiceById = exports.getInvoices = exports.createInvoice = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
// @desc        Create new Invoice
// @route       POST /api/v1/create-invoice
// @access      Private
exports.createInvoice = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const user = req.user;
    const { invoiceNumber, invoiceDate, dueDate, billFrom, billTo, items, notes, paymentTerms, } = req.body;
    //  subtotal calculation
    let subtotal = 0;
    let taxTotal = 0;
    items.forEach((item) => {
        subtotal += item.unitPrice * item.quantity;
        taxTotal +=
            (item.unitPrice * item.quantity * (item.taxPercent || 0)) / 100;
    });
    const total = subtotal + taxTotal;
    const invoice = new Invoice_1.default({
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
    });
    await invoice.save();
    res.status(201).json(invoice);
});
// @desc        Get all invoices of logged-in user
// @route       GET /api/v1/invoices
// @access      Private
exports.getInvoices = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const user = await User_1.default.findById(req.user?._id);
    const invoices = await Invoice_1.default.find({ user }).populate("user", "name email");
    res.status(200).json({
        success: true,
        invoices,
    });
});
// @desc        Get single invoices by ID
// @route       GET /api/v1/invoices/:id
// @access      Private
exports.getInvoiceById = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const invoice = await Invoice_1.default.findById(req.params.id).populate("user", "name email");
    if (!invoice)
        return next(new errorHandler_1.default("Invoice not found", 404));
    if (invoice.user._id.toString() !== req.user?._id.toString()) {
        return next(new errorHandler_1.default("Not authorized to access this invoice", 403));
    }
    res.status(200).json({
        success: true,
        invoice,
    });
});
// @desc        Update invoice
// @route       PUT /api/v1/update-invoice/:id
// @access      Private
exports.updateInvoice = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { invoiceNumber, invoiceDate, dueDate, billFrom, billTo, items, notes, paymentTerms, status, } = req.body;
    // Only recalculate totals if items were actually sent
    let totalsUpdate = {};
    if (items && items.length > 0) {
        let subtotal = 0;
        let taxTotal = 0;
        items.forEach((item) => {
            subtotal += item.unitPrice * item.quantity;
            taxTotal +=
                (item.unitPrice * item.quantity * (item.taxPercent || 0)) / 100;
        });
        const total = subtotal + taxTotal;
        totalsUpdate = { items, subtotal, taxTotal, total };
    }
    // Only include fields that were actually provided in the request
    const updateData = {
        ...(invoiceNumber !== undefined && { invoiceNumber }),
        ...(invoiceDate !== undefined && { invoiceDate }),
        ...(dueDate !== undefined && { dueDate }),
        ...(billFrom !== undefined && { billFrom }),
        ...(billTo !== undefined && { billTo }),
        ...(notes !== undefined && { notes }),
        ...(paymentTerms !== undefined && { paymentTerms }),
        ...(status !== undefined && { status }),
        ...totalsUpdate,
    };
    const updatedInvoice = await Invoice_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedInvoice)
        return res.status(404).json({ message: "Invoice not found" });
    res.status(200).json({
        success: true,
        updatedInvoice,
    });
});
// @desc        Duplicate an invoice
// @route       POST /api/v1/duplicate-invoice/:id
// @access      Private
exports.duplicateInvoice = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const original = await Invoice_1.default.findById(req.params.id);
    if (!original)
        return next(new errorHandler_1.default("Invoice not found", 404));
    // Find all invoices for this user to determine the next number
    const userInvoices = await Invoice_1.default.find({ user: req.user }).select("invoiceNumber");
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
    const duplicate = new Invoice_1.default({
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
});
// @desc    Update invoice preferences
// @route   PATCH /api/v1/update-invoice-preferences
// @access  Private
exports.updateInvoicePreferences = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { templateId, paletteId, colorPalette } = req.body;
    const user = await User_1.default.findByIdAndUpdate(req.user?._id, { invoicePreferences: { templateId, paletteId, colorPalette } }, { new: true });
    if (!user)
        return next(new errorHandler_1.default("User not found", 404));
    res
        .status(200)
        .json({ success: true, invoicePreferences: user.invoicePreferences });
});
// @desc        Get income by month for logged-in user (paid invoices only, calendar year)
// @route       GET /api/v1/income-by-month
// @access      Private
exports.getIncomeByMonth = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const user = req.user;
    const now = new Date();
    const currentYear = now.getFullYear();
    const year = Number(req.query.year) || currentYear;
    const startDate = new Date(year, 0, 1); // Jan 1, 00:00
    const endDate = new Date(year + 1, 0, 1); // Jan 1 of next year (exclusive upper bound)
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
});
// @desc        Delete invoice
// @route       DELETE /api/v1/delete-invoice/:id
// @access      Private
exports.deleteInvoice = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const invoice = await Invoice_1.default.findByIdAndDelete(req.params.id);
    if (!invoice)
        return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted successfully" });
});
