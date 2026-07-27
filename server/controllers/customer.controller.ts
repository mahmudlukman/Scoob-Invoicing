import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncErrors";
import Customer from "../models/Customer";
import ErrorHandler from "../utils/errorHandler";

// @desc    Create a new customer
// @route   POST /api/v1/create-customer
// @access  Private
export const createCustomer = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { clientName, email, address, phone } = req.body;

    const customer = new Customer({
      user: req.user?._id,
      clientName,
      email,
      address,
      phone,
    });

    await customer.save();
    res.status(201).json({ success: true, customer });
  },
);

// @desc    Get all customers for logged-in user
// @route   GET /api/v1/customers
// @access  Private
export const getCustomers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const customers = await Customer.find({ user: req.user?._id }).sort({
      clientName: 1,
    });
    res.status(200).json({ success: true, customers });
  },
);

// @desc    Update a customer
// @route   PUT /api/v1/update-customer/:id
// @access  Private
export const updateCustomer = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { clientName, email, address, phone } = req.body;

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, user: req.user?._id },
      { clientName, email, address, phone },
      { new: true },
    );

    if (!customer) return next(new ErrorHandler("Customer not found", 404));

    res.status(200).json({ success: true, customer });
  },
);

// @desc    Delete a customer
// @route   DELETE /api/v1/delete-customer/:id
// @access  Private
export const deleteCustomer = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!customer) return next(new ErrorHandler("Customer not found", 404));

    res.status(200).json({ success: true, message: "Customer deleted" });
  },
);
