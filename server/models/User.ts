import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config";

enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

interface Logo {
  public_id: string;
  url: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  businessName: string;
  businessLogo?: Logo;
  address: string;
  phone: string;
  role: string;
  isActive?: boolean;
  resetPasswordToken?: string;
  resetPasswordTime?: Date;
  getJwtToken(): string;
  getRefreshToken(): string;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name!"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email!"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      select: false,
    },
    businessName: {
      type: String,
      default: "",
    },
    businessLogo: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    address: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: String,
    resetPasswordTime: Date,
  },
  { minimize: false, timestamps: true }
);

// Hash password
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// JWT token
UserSchema.methods.getJwtToken = function (): string {
  return jwt.sign({ id: this._id }, config.JWT_SECRET_KEY as string, {
    expiresIn: config.JWT_EXPIRES || "15m",
  });
};

// JWT Refresh Token (long-lived)
UserSchema.methods.getRefreshToken = function (): string {
  return jwt.sign({ id: this._id }, config.REFRESH_TOKEN_SECRET as string, {
    expiresIn: config.REFRESH_TOKEN_EXPIRES || "7d", // Long-lived: 7 days
  });
};

// Compare password
UserSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User: Model<IUser> = mongoose.model("User", UserSchema);
export default User;
