"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.getCustomers = exports.createCustomer = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const Customer_1 = __importDefault(require("../models/Customer"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (email) => {
    if (typeof email !== "string" || email.trim() === "")
        return undefined;
    return email.trim().toLowerCase();
};
// @desc    Create a new customer
// @route   POST /api/v1/create-customer
// @access  Private
exports.createCustomer = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { clientName, address, phone } = req.body;
    if (!clientName || typeof clientName !== "string" || !clientName.trim()) {
        return next(new errorHandler_1.default("Client name is required", 400));
    }
    const email = normalizeEmail(req.body.email);
    if (req.body.email && !email) {
        return next(new errorHandler_1.default("Invalid email address", 400));
    }
    if (email && !EMAIL_REGEX.test(email)) {
        return next(new errorHandler_1.default("Invalid email address", 400));
    }
    // Guard against creating a duplicate of an existing customer for this
    // user — the invoice controller's saveCustomer flow already dedupes by
    // {user, email} via upsert, so this endpoint should behave consistently
    // rather than silently allowing a second record with the same email.
    if (email) {
        const existing = await Customer_1.default.findOne({ user: req.user?._id, email });
        if (existing) {
            return next(new errorHandler_1.default("A customer with this email already exists", 409));
        }
    }
    const customer = new Customer_1.default({
        user: req.user?._id,
        clientName: clientName.trim(),
        email,
        address,
        phone,
    });
    try {
        await customer.save();
    }
    catch (err) {
        if (err?.code === 11000) {
            return next(new errorHandler_1.default("A customer with this email already exists", 409));
        }
        throw err;
    }
    res.status(201).json({ success: true, customer });
});
// @desc    Get all customers for logged-in user
// @route   GET /api/v1/customers
// @access  Private
exports.getCustomers = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const customers = await Customer_1.default.find({ user: req.user?._id }).sort({
        clientName: 1,
    });
    res.status(200).json({ success: true, customers });
});
// @desc    Update a customer
// @route   PUT /api/v1/update-customer/:id
// @access  Private
exports.updateCustomer = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
        return next(new errorHandler_1.default("Invalid customer id", 400));
    }
    const { clientName, address, phone } = req.body;
    if (clientName !== undefined &&
        (typeof clientName !== "string" || !clientName.trim())) {
        return next(new errorHandler_1.default("Client name cannot be empty", 400));
    }
    let email;
    if (req.body.email !== undefined) {
        email = normalizeEmail(req.body.email);
        if (!email || !EMAIL_REGEX.test(email)) {
            return next(new errorHandler_1.default("Invalid email address", 400));
        }
        // Prevent this update from colliding with a different customer that
        // already owns that email for this user.
        const existing = await Customer_1.default.findOne({
            user: req.user?._id,
            email,
            _id: { $ne: req.params.id },
        });
        if (existing) {
            return next(new errorHandler_1.default("Another customer with this email already exists", 409));
        }
    }
    let customer;
    try {
        customer = await Customer_1.default.findOneAndUpdate({ _id: req.params.id, user: req.user?._id }, {
            ...(clientName !== undefined && { clientName: clientName.trim() }),
            ...(email !== undefined && { email }),
            ...(address !== undefined && { address }),
            ...(phone !== undefined && { phone }),
        }, { new: true, runValidators: true });
    }
    catch (err) {
        if (err?.code === 11000) {
            return next(new errorHandler_1.default("Another customer with this email already exists", 409));
        }
        throw err;
    }
    if (!customer)
        return next(new errorHandler_1.default("Customer not found", 404));
    res.status(200).json({ success: true, customer });
});
// @desc    Delete a customer
// @route   DELETE /api/v1/delete-customer/:id
// @access  Private
exports.deleteCustomer = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
        return next(new errorHandler_1.default("Invalid customer id", 400));
    }
    const customer = await Customer_1.default.findOneAndDelete({
        _id: req.params.id,
        user: req.user?._id,
    });
    if (!customer)
        return next(new errorHandler_1.default("Customer not found", 404));
    res.status(200).json({ success: true, message: "Customer deleted" });
});
