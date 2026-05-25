import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncErrors";
import User, { IUser } from "../models/User";
import ErrorHandler from "../utils/errorHandler";
import Invoice, { IItem } from "../models/Invoice";

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
    });

    await invoice.save();
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
    res.status(200).json({
      success: true,
      invoices,
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

    // // check if the invoice belongs to the user
    // if (invoice.user._id.toString() !== req.user?._id) {
    //   return next(new ErrorHandler("Not authorized", 400));
    // }

    res.status(200).json({
      success: true,
      invoice,
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

    //  recalculate totals if item changed
    let subtotal = 0;
    let taxTotal = 0;
    if (items && items.length > 0) {
      items.forEach((item: IItem) => {
        subtotal += item.unitPrice * item.quantity;
        taxTotal +=
          (item.unitPrice * item.quantity * (item.taxPercent || 0)) / 100;
      });
    }

    const total = subtotal + taxTotal;

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        invoiceNumber,
        invoiceDate,
        dueDate,
        billFrom,
        billTo,
        items,
        notes,
        paymentTerms,
        status,
        subtotal,
        taxTotal,
        total,
      },
      { new: true },
    );
    if (!updatedInvoice)
      return res.status(404).json({ message: "Invoice not found" });

    res.json(updatedInvoice);
    res.status(200).json({
      success: true,
      updatedInvoice,
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
