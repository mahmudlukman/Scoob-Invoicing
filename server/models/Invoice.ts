import mongoose, { Schema, Document, Model } from "mongoose";

// Item interface
export interface IItem {
  name: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  total: number;
}

// Item schema definition
const ItemSchema = new Schema<IItem>({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  taxPercent: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
});

// Payment interface
export interface IPayment {
  _id?: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  method?: string;
  note?: string;
}

// Payment schema definition
const PaymentSchema = new Schema<IPayment>({
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  method: {
    type: String,
  },
  note: {
    type: String,
  },
});

// Invoice interface
export interface IInvoice extends Document {
  user: mongoose.Types.ObjectId;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate?: Date;
  billFrom: {
    businessName?: string;
    businessLogo?: string;
    email?: string;
    address?: string;
    phone?: string;
  };
  billTo: {
    clientName?: string;
    email?: string;
    address?: string;
    phone?: string;
  };
  items: IItem[];
  notes?: string;
  paymentTerms: string;
  status: "Paid" | "Unpaid" | "Pending" | "Partially Paid";
  subtotal?: number;
  taxTotal?: number;
  total?: number;
  payments: IPayment[];
  createdAt: Date;
  updatedAt: Date;
}

// Invoice schema definition
const InvoiceSchema = new Schema<IInvoice>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    billFrom: {
      businessName: String,
      email: String,
      address: String,
      phone: String,
    },
    billTo: {
      clientName: String,
      email: String,
      address: String,
      phone: String,
    },
    items: [ItemSchema],
    notes: {
      type: String,
    },
    paymentTerms: {
      type: String,
      default: "Net 15",
    },
    status: {
      type: String,
      enum: ["Paid", "Unpaid", "Pending", "Partially Paid"],
      default: "Unpaid",
    },
    subtotal: Number,
    taxTotal: Number,
    total: Number,
    payments: {
      type: [PaymentSchema],
      default: [],
    },
  },
  { timestamps: true },
);

// Export the model
const Invoice: Model<IInvoice> = mongoose.model<IInvoice>(
  "Invoice",
  InvoiceSchema,
);
export default Invoice;
