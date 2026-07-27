import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomer extends Document {
  user: mongoose.Types.ObjectId;
  clientName: string;
  email?: string;
  address?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    email: String,
    address: String,
    phone: String,
  },
  { timestamps: true },
);

CustomerSchema.index({ user: 1, email: 1 }, { unique: true, sparse: true });

const Customer: Model<ICustomer> = mongoose.model<ICustomer>(
  "Customer",
  CustomerSchema,
);
export default Customer;
