"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.getCustomers = exports.createCustomer = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const Customer_1 = __importDefault(require("../models/Customer"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
// @desc    Create a new customer
// @route   POST /api/v1/create-customer
// @access  Private
exports.createCustomer = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { clientName, email, address, phone } = req.body;
    const customer = new Customer_1.default({
        user: req.user?._id,
        clientName,
        email,
        address,
        phone,
    });
    await customer.save();
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
    const { clientName, email, address, phone } = req.body;
    const customer = await Customer_1.default.findOneAndUpdate({ _id: req.params.id, user: req.user?._id }, { clientName, email, address, phone }, { new: true });
    if (!customer)
        return next(new errorHandler_1.default("Customer not found", 404));
    res.status(200).json({ success: true, customer });
});
// @desc    Delete a customer
// @route   DELETE /api/v1/delete-customer/:id
// @access  Private
exports.deleteCustomer = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const customer = await Customer_1.default.findOneAndDelete({
        _id: req.params.id,
        user: req.user?._id,
    });
    if (!customer)
        return next(new errorHandler_1.default("Customer not found", 404));
    res.status(200).json({ success: true, message: "Customer deleted" });
});
