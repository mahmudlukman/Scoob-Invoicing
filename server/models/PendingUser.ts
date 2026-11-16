import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPendingUser extends Document {
  name: string;
  email: string;
  password: string; // already bcrypt-hashed
  otpHash: string;
  attempts: number;
  lastSentAt: Date;
  expiresAt: Date;
}

const PendingUserSchema: Schema<IPendingUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

// TTL index: MongoDB removes the document shortly after expiresAt passes
PendingUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PendingUser: Model<IPendingUser> = mongoose.model<IPendingUser>(
  "PendingUser",
  PendingUserSchema,
);
export default PendingUser;