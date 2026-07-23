"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserStatus = exports.getAllUsers = exports.getUserById = exports.updatePassword = exports.updateUserProfile = exports.getMe = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const cloudinary_1 = __importDefault(require("cloudinary"));
// @desc       get logged in user
// @route      PUT /api/v1/me
// @access     Private
exports.getMe = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const user = await User_1.default.findById(req.user?._id);
    if (!user) {
        return next(new errorHandler_1.default("User doesn't exists", 400));
    }
    res.status(200).json({
        success: true,
        user,
    });
});
exports.updateUserProfile = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { name, businessName, address, phone, businessLogo } = req.body;
    const user = await User_1.default.findById(req.user?._id);
    if (!user) {
        return next(new errorHandler_1.default("User not found", 404));
    }
    // Build update object dynamically
    const updates = {};
    if (name)
        updates.name = name;
    if (businessName)
        updates.businessName = businessName;
    if (address)
        updates.address = address;
    if (phone)
        updates.phone = phone;
    // Handle logo upload separately (requires deletion logic)
    if (businessLogo) {
        if (user.businessLogo?.public_id) {
            await cloudinary_1.default.v2.uploader.destroy(user.businessLogo.public_id);
        }
        const myCloud = await cloudinary_1.default.v2.uploader.upload(businessLogo, {
            folder: "businessLogo",
            width: 150,
        });
        updates.businessLogo = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    }
    // Update all fields at once
    const updatedUser = await User_1.default.findByIdAndUpdate(req.user?._id, { $set: updates }, { new: true, runValidators: true });
    res.status(200).json({ success: true, user: updatedUser });
});
exports.updatePassword = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return next(new errorHandler_1.default("Please enter old and new password", 400));
    }
    const user = await User_1.default.findById(req.user?._id).select("+password");
    if (user?.password === undefined) {
        return next(new errorHandler_1.default("Invalid user", 400));
    }
    // Verify the old password is correct
    const isOldPasswordValid = await user.comparePassword(oldPassword);
    if (!isOldPasswordValid) {
        return next(new errorHandler_1.default("Old password is incorrect", 400));
    }
    // Check if new password is different from current password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
        return next(new errorHandler_1.default("New password must be different from the previous one!", 400));
    }
    if (newPassword.trim().length < 6 || newPassword.trim().length > 20) {
        return next(new errorHandler_1.default("Password must be at least 6 characters and no more than 20 characters!", 400));
    }
    user.password = newPassword.trim();
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password updated successfully!",
    });
});
// @desc       get user by Id
// @route      PUT /api/v1/user/:id
// @access     Private (Admin)
exports.getUserById = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const user = await User_1.default.findById(req.params.id);
    res.status(201).json({
        success: true,
        user,
    });
});
// @desc       get all users
// @route      PUT /api/v1/users
// @access     Private (Admin)
exports.getAllUsers = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    // Parse and validate query parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 10));
    const search = req.query.search;
    const role = req.query.role;
    const isActiveParam = req.query.isActive;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";
    const skipAmount = (page - 1) * pageSize;
    // Build dynamic query
    const query = {};
    // Add search functionality
    if (search && search.trim()) {
        query.$or = [
            { name: { $regex: search.trim(), $options: "i" } },
            { email: { $regex: search.trim(), $options: "i" } },
        ];
    }
    // Filter by role
    if (role && role !== "all") {
        query.role = role;
    }
    // Filter by active status
    if (isActiveParam && isActiveParam !== "all") {
        query.isActive = isActiveParam === "true";
    }
    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    // Execute queries in parallel for better performance
    const [users, totalUsers] = await Promise.all([
        User_1.default.find(query)
            .select("-password -refreshToken")
            .skip(skipAmount)
            .limit(pageSize)
            .sort(sortOptions)
            .lean(),
        User_1.default.countDocuments(query),
    ]);
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalUsers / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    // Handle edge case where page exceeds total pages
    if (page > totalPages && totalPages > 0) {
        return res.status(400).json({
            success: false,
            message: `Page ${page} exceeds total pages (${totalPages})`,
        });
    }
    res.status(200).json({
        success: true,
        users,
        pagination: {
            currentPage: page,
            pageSize,
            totalItems: totalUsers,
            totalPages,
            hasNextPage,
            hasPrevPage,
            isNext: hasNextPage,
        },
        filters: {
            search: search || null,
            role: role || null,
            isActive: isActiveParam || null,
            sortBy,
            sortOrder,
        },
    });
});
// @desc       update user status
// @route      PUT /api/v1/update-status
// @access     Private (Admin)
exports.updateUserStatus = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { id, role, isActive } = req.body;
    const user = await User_1.default.findById(id);
    if (!user) {
        return next(new errorHandler_1.default(`User not found: ${id}`, 404));
    }
    const updatedUser = await User_1.default.findByIdAndUpdate(id, { role, isActive }, { new: true });
    res.status(201).json({ success: true, updatedUser });
});
// @desc       delete user
// @route      PUT /api/v1/delete-user
// @access     Private (Admin)
exports.deleteUser = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const user = await User_1.default.findById(req.params.id);
    if (!user) {
        return next(new errorHandler_1.default("User is not available with this id", 404));
    }
    await User_1.default.findByIdAndDelete(req.params.id);
    res.status(201).json({
        success: true,
        message: "User deleted successfully!",
    });
});
