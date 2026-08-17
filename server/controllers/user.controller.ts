import { NextFunction, Request, Response } from "express";
import mongoose, { FilterQuery } from "mongoose";
import cloudinary from "cloudinary";
import { catchAsyncError } from "../middleware/catchAsyncErrors";
import User, { IUser, UserRole } from "../models/User";
import ErrorHandler from "../utils/errorHandler";
import { getCurrencyByCode } from "../utils/currencies";
import Invoice from "../models/Invoice";
import Customer from "../models/Customer";
import { accessTokenOptions, refreshTokenOptions } from "../utils/jwtToken";

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 20;

const NAME_MAX_LENGTH = 100;
const BUSINESS_NAME_MAX_LENGTH = 200;
const ADDRESS_MAX_LENGTH = 500;
const PHONE_MAX_LENGTH = 20;

const ALLOWED_SORT_FIELDS = ["createdAt", "name", "email", "role", "isActive"];

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const clearAuthCookies = (res: Response) => {
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
export const getMe = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return next(new ErrorHandler("User doesn't exists", 400));
    }

    res.status(200).json({
      success: true,
      user,
    });
  },
);

// @desc       update user profile
// @route      PUT /api/v1/update-user
// @access     Private
interface IUpdateUser {
  name?: string;
  businessName?: string;
  address?: string;
  phone?: string;
  businessLogo?: string;
  defaultCurrency?: { code: string; symbol: string };
}

export const updateUserProfile = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      businessName,
      address,
      phone,
      businessLogo,
      defaultCurrency,
    } = req.body as IUpdateUser;

    const user = await User.findById(req.user?._id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const updates: Partial<IUser> = {};

    if (name) {
      const trimmedName = name.trim();
      if (trimmedName.length > NAME_MAX_LENGTH) {
        return next(
          new ErrorHandler(
            `Name must be under ${NAME_MAX_LENGTH} characters`,
            400,
          ),
        );
      }
      updates.name = trimmedName;
    }

    if (businessName) {
      const trimmed = businessName.trim();
      if (trimmed.length > BUSINESS_NAME_MAX_LENGTH) {
        return next(
          new ErrorHandler(
            `Business name must be under ${BUSINESS_NAME_MAX_LENGTH} characters`,
            400,
          ),
        );
      }
      updates.businessName = trimmed;
    }

    if (address) {
      const trimmed = address.trim();
      if (trimmed.length > ADDRESS_MAX_LENGTH) {
        return next(
          new ErrorHandler(
            `Address must be under ${ADDRESS_MAX_LENGTH} characters`,
            400,
          ),
        );
      }
      updates.address = trimmed;
    }

    if (phone) {
      const trimmed = phone.trim();
      if (trimmed.length > PHONE_MAX_LENGTH) {
        return next(
          new ErrorHandler(
            `Phone must be under ${PHONE_MAX_LENGTH} characters`,
            400,
          ),
        );
      }
      updates.phone = trimmed;
    }

    if (defaultCurrency) {
      try {
        const currency = getCurrencyByCode(defaultCurrency.code);
        updates.defaultCurrency = {
          code: currency.code,
          symbol: currency.symbol,
        };
      } catch (error) {
        return next(new ErrorHandler("Invalid currency code", 400));
      }
    }

    if (businessLogo) {
      let myCloud;
      try {
        myCloud = await cloudinary.v2.uploader.upload(businessLogo, {
          folder: "businessLogo",
          width: 150,
        });
      } catch (error) {
        return next(new ErrorHandler("Failed to upload business logo", 500));
      }

      if (user.businessLogo?.public_id) {
        await cloudinary.v2.uploader
          .destroy(user.businessLogo.public_id)
          .catch(() => {});
      }

      updates.businessLogo = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    res.status(200).json({ success: true, user: updatedUser });
  },
);

// @desc       update user password
// @route      PUT /api/v1/update-password
// @access     Private
interface IUpdatePassword {
  oldPassword?: string;
  newPassword?: string;
}

export const updatePassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body as IUpdatePassword;

    if (!oldPassword || !newPassword) {
      return next(new ErrorHandler("Please enter old and new password", 400));
    }

    const trimmedNewPassword = newPassword.trim();

    if (
      trimmedNewPassword.length < MIN_PASSWORD_LENGTH ||
      trimmedNewPassword.length > MAX_PASSWORD_LENGTH
    ) {
      return next(
        new ErrorHandler(
          `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters!`,
          400,
        ),
      );
    }

    const user = await User.findById(req.user?._id).select("+password");

    if (user?.password === undefined) {
      return next(new ErrorHandler("Invalid user", 400));
    }

    const isOldPasswordValid = await user.comparePassword(oldPassword);
    if (!isOldPasswordValid) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }

    const isSamePassword = await user.comparePassword(trimmedNewPassword);
    if (isSamePassword) {
      return next(
        new ErrorHandler(
          "New password must be different from the previous one!",
          400,
        ),
      );
    }

    user.password = trimmedNewPassword;
    await user.save();

    const newAccessToken = user.getJwtToken();
    const newRefreshToken = user.getRefreshToken();

    res.cookie("access_token", newAccessToken, accessTokenOptions);
    res.cookie("refresh_token", newRefreshToken, refreshTokenOptions);

    res.status(200).json({
      success: true,
      message: "Password updated successfully!",
      accessToken: newAccessToken,
    });
  },
);

// @desc       get user by Id
// @route      GET /api/v1/user/:id
// @access     Private (Admin)
export const getUserById = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ErrorHandler("Invalid user id", 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  },
);

// @desc       get all users
// @route      GET /api/v1/users
// @access     Private (Admin)
export const getAllUsers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(req.query.pageSize as string) || 10),
    );

    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const role =
      typeof req.query.role === "string" ? req.query.role : undefined;
    const isActiveParam =
      typeof req.query.isActive === "string" ? req.query.isActive : undefined;
    const sortByRaw =
      typeof req.query.sortBy === "string" ? req.query.sortBy : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

    const sortBy = ALLOWED_SORT_FIELDS.includes(sortByRaw)
      ? sortByRaw
      : "createdAt";

    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof User> = {};

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (role && role !== "all") {
      if (!Object.values(UserRole).includes(role as UserRole)) {
        return next(new ErrorHandler("Invalid role filter", 400));
      }
      query.role = role;
    }

    if (isActiveParam && isActiveParam !== "all") {
      if (isActiveParam !== "true" && isActiveParam !== "false") {
        return next(new ErrorHandler("Invalid isActive filter", 400));
      }
      query.isActive = isActiveParam === "true";
    }

    const sortOptions: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "desc" ? -1 : 1,
    };

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select("-password")
        .skip(skipAmount)
        .limit(pageSize)
        .sort(sortOptions)
        .lean(),
      User.countDocuments(query),
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
  },
);

// @desc       update user status
// @route      PUT /api/v1/update-status
// @access     Private (Admin)
export const updateUserStatus = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, role, isActive } = req.body;

    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler("Invalid user id", 400));
    }

    if (role !== undefined && !Object.values(UserRole).includes(role)) {
      return next(new ErrorHandler("Invalid role", 400));
    }

    if (isActive !== undefined && typeof isActive !== "boolean") {
      return next(new ErrorHandler("isActive must be a boolean", 400));
    }

    if (req.user && id === req.user._id.toString()) {
      return next(
        new ErrorHandler(
          "You cannot modify your own account via this endpoint",
          400,
        ),
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorHandler(`User not found: ${id}`, 404));
    }

    const updates: Partial<IUser> = {};
    if (role !== undefined) updates.role = role;
    if (isActive !== undefined) {
      updates.isActive = isActive;
      updates.suspendedByAdmin = !isActive;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    res.status(200).json({ success: true, updatedUser });
  },
);

// @desc       delete user
// @route      DELETE /api/v1/delete-user/:id
// @access     Private (Admin)
export const deleteUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ErrorHandler("Invalid user id", 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorHandler("User is not available with this id", 404));
    }

    const userId = user._id;

    await Promise.all([
      Invoice.deleteMany({ user: userId }),
      Customer.deleteMany({ user: userId }),
    ]);

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully!",
    });
  },
);

// @desc        Delete the logged-in user's account and all associated data
// @route       DELETE /api/v1/delete-account
// @access      Private
export const deleteAccount = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;

    if (!password) {
      return next(
        new ErrorHandler("Password is required to delete your account", 400),
      );
    }

    const user = await User.findById(req.user?._id).select("+password");
    if (!user) return next(new ErrorHandler("User not found", 404));

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new ErrorHandler("Incorrect password", 401));
    }

    const userId = user._id;

    await Promise.all([
      Invoice.deleteMany({ user: userId }),
      Customer.deleteMany({ user: userId }),
    ]);

    await user.deleteOne();

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: "Your account and all associated data have been deleted",
    });
  },
);

// @desc        Deactivate the logged-in user's account (reversible)
// @route       PATCH /api/v1/deactivate-account
// @access      Private
export const deactivateAccount = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;

    if (!password) {
      return next(
        new ErrorHandler(
          "Password is required to deactivate your account",
          400,
        ),
      );
    }

    const user = await User.findById(req.user?._id).select("+password");
    if (!user) return next(new ErrorHandler("User not found", 404));

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new ErrorHandler("Incorrect password", 401));
    }

    user.isActive = false;
    user.suspendedByAdmin = false;
    await user.save();

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: "Your account has been deactivated",
    });
  },
);

// @desc        Reactivate a deactivated account
// @route       PATCH /api/v1/reactivate-account
// @access      Private
export const reactivateAccount = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user?._id);
    if (!user) return next(new ErrorHandler("User not found", 404));

    if (user.isActive) {
      return next(new ErrorHandler("Your account is already active", 400));
    }

    if (user.suspendedByAdmin) {
      return next(
        new ErrorHandler(
          "This account was suspended by an admin. Please contact support to reactivate it.",
          403,
        ),
      );
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Your account has been reactivated",
    });
  },
);
