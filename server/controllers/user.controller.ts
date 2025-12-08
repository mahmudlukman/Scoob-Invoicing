import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncErrors";
import User, { IUser } from "../models/User";
import ErrorHandler from "../utils/errorHandler";
import cloudinary from "cloudinary";
import { FilterQuery } from "mongoose";

// @desc       get logged in user
// @route      PUT /api/v1/me
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
  }
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
}

export const updateUserProfile = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, businessName, address, phone, businessLogo } =
      req.body as IUpdateUser;

    const user = await User.findById(req.user?._id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Build update object dynamically
    const updates: Partial<IUser> = {};
    if (name) updates.name = name;
    if (businessName) updates.businessName = businessName;
    if (address) updates.address = address;
    if (phone) updates.phone = phone;

    // Handle logo upload separately (requires deletion logic)
    if (businessLogo) {
      if (user.businessLogo?.public_id) {
        await cloudinary.v2.uploader.destroy(user.businessLogo.public_id);
      }

      const myCloud = await cloudinary.v2.uploader.upload(businessLogo, {
        folder: "businessLogo",
        width: 150,
      });

      updates.businessLogo = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    // Update all fields at once
    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user: updatedUser });
  }
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

    const user = await User.findById(req.user?._id).select("+password");

    if (user?.password === undefined) {
      return next(new ErrorHandler("Invalid user", 400));
    }

    // Verify the old password is correct
    const isOldPasswordValid = await user.comparePassword(oldPassword);
    if (!isOldPasswordValid) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }

    // Check if new password is different from current password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return next(
        new ErrorHandler(
          "New password must be different from the previous one!",
          400
        )
      );
    }

    if (newPassword.trim().length < 6 || newPassword.trim().length > 20) {
      return next(
        new ErrorHandler(
          "Password must be at least 6 characters and no more than 20 characters!",
          400
        )
      );
    }

    user.password = newPassword.trim();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully!",
    });
  }
);

// @desc       get user by Id
// @route      PUT /api/v1/user/:id
// @access     Private (Admin)
export const getUserById = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);
    res.status(201).json({
      success: true,
      user,
    });
  }
);

// @desc       get all users
// @route      PUT /api/v1/users
// @access     Private (Admin)
export const getAllUsers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // Parse and validate query parameters
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(req.query.pageSize as string) || 10)
    );
    const search = req.query.search as string;
    const role = req.query.role as string;
    const isActiveParam = req.query.isActive as string;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    const skipAmount = (page - 1) * pageSize;

    // Build dynamic query
    const query: FilterQuery<typeof User> = {};

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
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute queries in parallel for better performance
    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select("-password -refreshToken")
        .skip(skipAmount)
        .limit(pageSize)
        .sort(sortOptions)
        .lean(),
      User.countDocuments(query),
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
  }
);

// @desc       update user status
// @route      PUT /api/v1/update-status
// @access     Private (Admin)
export const updateUserStatus = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, role, isActive } = req.body;
    const user = await User.findById(id);

    if (!user) {
      return next(new ErrorHandler(`User not found: ${id}`, 404));
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role, isActive },
      { new: true }
    );

    res.status(201).json({ success: true, updatedUser });
  }
);

// @desc       delete user
// @route      PUT /api/v1/delete-user
// @access     Private (Admin)
export const deleteUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorHandler("User is not available with this id", 404));
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(201).json({
      success: true,
      message: "User deleted successfully!",
    });
  }
);
