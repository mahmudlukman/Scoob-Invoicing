"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactivateAccount = exports.deactivateAccount = exports.deleteAccount = exports.deleteUser = exports.updateUserStatus = exports.getAllUsers = exports.getUserById = exports.updatePassword = exports.updateUserProfile = exports.getMe = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const User_1 = __importStar(require("../models/User"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const currencies_1 = require("../utils/currencies");
const Invoice_1 = __importDefault(require("../models/Invoice"));
const Customer_1 = __importDefault(require("../models/Customer"));
const jwtToken_1 = require("../utils/jwtToken");
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 20;
const NAME_MAX_LENGTH = 100;
const BUSINESS_NAME_MAX_LENGTH = 200;
const ADDRESS_MAX_LENGTH = 500;
const PHONE_MAX_LENGTH = 20;
const ALLOWED_SORT_FIELDS = ["createdAt", "name", "email", "role", "isActive"];
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const clearAuthCookies = (res) => {
    res.cookie("access_token", "", {
        maxAge: 1,
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    res.cookie("refresh_token", "", {
        maxAge: 1,
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
};
// @desc       get logged in user
// @route      GET /api/v1/me
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
    const { name, businessName, address, phone, businessLogo, defaultCurrency, } = req.body;
    const user = await User_1.default.findById(req.user?._id);
    if (!user) {
        return next(new errorHandler_1.default("User not found", 404));
    }
    const updates = {};
    if (name) {
        const trimmedName = name.trim();
        if (trimmedName.length > NAME_MAX_LENGTH) {
            return next(new errorHandler_1.default(`Name must be under ${NAME_MAX_LENGTH} characters`, 400));
        }
        updates.name = trimmedName;
    }
    if (businessName) {
        const trimmed = businessName.trim();
        if (trimmed.length > BUSINESS_NAME_MAX_LENGTH) {
            return next(new errorHandler_1.default(`Business name must be under ${BUSINESS_NAME_MAX_LENGTH} characters`, 400));
        }
        updates.businessName = trimmed;
    }
    if (address) {
        const trimmed = address.trim();
        if (trimmed.length > ADDRESS_MAX_LENGTH) {
            return next(new errorHandler_1.default(`Address must be under ${ADDRESS_MAX_LENGTH} characters`, 400));
        }
        updates.address = trimmed;
    }
    if (phone) {
        const trimmed = phone.trim();
        if (trimmed.length > PHONE_MAX_LENGTH) {
            return next(new errorHandler_1.default(`Phone must be under ${PHONE_MAX_LENGTH} characters`, 400));
        }
        updates.phone = trimmed;
    }
    if (defaultCurrency) {
        try {
            const currency = (0, currencies_1.getCurrencyByCode)(defaultCurrency.code);
            updates.defaultCurrency = {
                code: currency.code,
                symbol: currency.symbol,
            };
        }
        catch (error) {
            return next(new errorHandler_1.default("Invalid currency code", 400));
        }
    }
    if (businessLogo) {
        let myCloud;
        try {
            myCloud = await cloudinary_1.default.v2.uploader.upload(businessLogo, {
                folder: "businessLogo",
                width: 150,
            });
        }
        catch (error) {
            return next(new errorHandler_1.default("Failed to upload business logo", 500));
        }
        if (user.businessLogo?.public_id) {
            await cloudinary_1.default.v2.uploader
                .destroy(user.businessLogo.public_id)
                .catch(() => { });
        }
        updates.businessLogo = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    }
    const updatedUser = await User_1.default.findByIdAndUpdate(req.user?._id, { $set: updates }, { new: true, runValidators: true });
    res.status(200).json({ success: true, user: updatedUser });
});
exports.updatePassword = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return next(new errorHandler_1.default("Please enter old and new password", 400));
    }
    const trimmedNewPassword = newPassword.trim();
    if (trimmedNewPassword.length < MIN_PASSWORD_LENGTH ||
        trimmedNewPassword.length > MAX_PASSWORD_LENGTH) {
        return next(new errorHandler_1.default(`Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters!`, 400));
    }
    const user = await User_1.default.findById(req.user?._id).select("+password");
    if (user?.password === undefined) {
        return next(new errorHandler_1.default("Invalid user", 400));
    }
    const isOldPasswordValid = await user.comparePassword(oldPassword);
    if (!isOldPasswordValid) {
        return next(new errorHandler_1.default("Old password is incorrect", 400));
    }
    const isSamePassword = await user.comparePassword(trimmedNewPassword);
    if (isSamePassword) {
        return next(new errorHandler_1.default("New password must be different from the previous one!", 400));
    }
    user.password = trimmedNewPassword;
    await user.save();
    const newAccessToken = user.getJwtToken();
    const newRefreshToken = user.getRefreshToken();
    res.cookie("access_token", newAccessToken, jwtToken_1.accessTokenOptions);
    res.cookie("refresh_token", newRefreshToken, jwtToken_1.refreshTokenOptions);
    res.status(200).json({
        success: true,
        message: "Password updated successfully!",
        accessToken: newAccessToken,
    });
});
// @desc       get user by Id
// @route      GET /api/v1/user/:id
// @access     Private (Admin)
exports.getUserById = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
        return next(new errorHandler_1.default("Invalid user id", 400));
    }
    const user = await User_1.default.findById(req.params.id);
    if (!user) {
        return next(new errorHandler_1.default("User not found", 404));
    }
    res.status(200).json({
        success: true,
        user,
    });
});
// @desc       get all users
// @route      GET /api/v1/users
// @access     Private (Admin)
exports.getAllUsers = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 10));
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const role = typeof req.query.role === "string" ? req.query.role : undefined;
    const isActiveParam = typeof req.query.isActive === "string" ? req.query.isActive : undefined;
    const sortByRaw = typeof req.query.sortBy === "string" ? req.query.sortBy : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";
    const sortBy = ALLOWED_SORT_FIELDS.includes(sortByRaw)
        ? sortByRaw
        : "createdAt";
    const skipAmount = (page - 1) * pageSize;
    const query = {};
    if (search && search.trim()) {
        const safeSearch = escapeRegex(search.trim());
        query.$or = [
            { name: { $regex: safeSearch, $options: "i" } },
            { email: { $regex: safeSearch, $options: "i" } },
        ];
    }
    if (role && role !== "all") {
        if (!Object.values(User_1.UserRole).includes(role)) {
            return next(new errorHandler_1.default("Invalid role filter", 400));
        }
        query.role = role;
    }
    if (isActiveParam && isActiveParam !== "all") {
        if (isActiveParam !== "true" && isActiveParam !== "false") {
            return next(new errorHandler_1.default("Invalid isActive filter", 400));
        }
        query.isActive = isActiveParam === "true";
    }
    const sortOptions = {
        [sortBy]: sortOrder === "desc" ? -1 : 1,
    };
    const [users, totalUsers] = await Promise.all([
        User_1.default.find(query)
            .select("-password")
            .skip(skipAmount)
            .limit(pageSize)
            .sort(sortOptions)
            .lean(),
        User_1.default.countDocuments(query),
    ]);
    const totalPages = Math.ceil(totalUsers / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
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
    if (!id || typeof id !== "string" || !mongoose_1.default.Types.ObjectId.isValid(id)) {
        return next(new errorHandler_1.default("Invalid user id", 400));
    }
    if (role !== undefined && !Object.values(User_1.UserRole).includes(role)) {
        return next(new errorHandler_1.default("Invalid role", 400));
    }
    if (isActive !== undefined && typeof isActive !== "boolean") {
        return next(new errorHandler_1.default("isActive must be a boolean", 400));
    }
    if (req.user && id === req.user._id.toString()) {
        return next(new errorHandler_1.default("You cannot modify your own account via this endpoint", 400));
    }
    const user = await User_1.default.findById(id);
    if (!user) {
        return next(new errorHandler_1.default(`User not found: ${id}`, 404));
    }
    const updates = {};
    if (role !== undefined)
        updates.role = role;
    if (isActive !== undefined) {
        updates.isActive = isActive;
        updates.suspendedByAdmin = !isActive;
    }
    const updatedUser = await User_1.default.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    res.status(200).json({ success: true, updatedUser });
});
// @desc       delete user
// @route      DELETE /api/v1/delete-user/:id
// @access     Private (Admin)
exports.deleteUser = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
        return next(new errorHandler_1.default("Invalid user id", 400));
    }
    const user = await User_1.default.findById(req.params.id);
    if (!user) {
        return next(new errorHandler_1.default("User is not available with this id", 404));
    }
    const userId = user._id;
    await Promise.all([
        Invoice_1.default.deleteMany({ user: userId }),
        Customer_1.default.deleteMany({ user: userId }),
    ]);
    await user.deleteOne();
    res.status(200).json({
        success: true,
        message: "User deleted successfully!",
    });
});
// @desc        Delete the logged-in user's account and all associated data
// @route       DELETE /api/v1/delete-account
// @access      Private
exports.deleteAccount = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { password } = req.body;
    if (!password) {
        return next(new errorHandler_1.default("Password is required to delete your account", 400));
    }
    const user = await User_1.default.findById(req.user?._id).select("+password");
    if (!user)
        return next(new errorHandler_1.default("User not found", 404));
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return next(new errorHandler_1.default("Incorrect password", 401));
    }
    const userId = user._id;
    await Promise.all([
        Invoice_1.default.deleteMany({ user: userId }),
        Customer_1.default.deleteMany({ user: userId }),
    ]);
    await user.deleteOne();
    clearAuthCookies(res);
    res.status(200).json({
        success: true,
        message: "Your account and all associated data have been deleted",
    });
});
// @desc        Deactivate the logged-in user's account (reversible)
// @route       PATCH /api/v1/deactivate-account
// @access      Private
exports.deactivateAccount = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const { password } = req.body;
    if (!password) {
        return next(new errorHandler_1.default("Password is required to deactivate your account", 400));
    }
    const user = await User_1.default.findById(req.user?._id).select("+password");
    if (!user)
        return next(new errorHandler_1.default("User not found", 404));
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return next(new errorHandler_1.default("Incorrect password", 401));
    }
    user.isActive = false;
    user.suspendedByAdmin = false;
    await user.save();
    clearAuthCookies(res);
    res.status(200).json({
        success: true,
        message: "Your account has been deactivated",
    });
});
// @desc        Reactivate a deactivated account
// @route       PATCH /api/v1/reactivate-account
// @access      Private
exports.reactivateAccount = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const user = await User_1.default.findById(req.user?._id);
    if (!user)
        return next(new errorHandler_1.default("User not found", 404));
    if (user.isActive) {
        return next(new errorHandler_1.default("Your account is already active", 400));
    }
    if (user.suspendedByAdmin) {
        return next(new errorHandler_1.default("This account was suspended by an admin. Please contact support to reactivate it.", 403));
    }
    user.isActive = true;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Your account has been reactivated",
    });
});
