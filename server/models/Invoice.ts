import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICurrency {
  code: string;
  symbol: string;
}

const CurrencySchema = new Schema<ICurrency>(
  {
    code: { type: String, required: true },
    symbol: { type: String, required: true },
  },
  { _id: false },
);

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
    min: 0,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  taxPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  total: {
    type: Number,
    required: true,
  },
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  currency: ICurrency;
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
  lastReceiptSentAt?: Date;
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
    currency: {
      type: CurrencySchema,
      required: true,
      default: { code: "NGN", symbol: "₦" },
    },
    dueDate: {
      type: Date,
    },
    billFrom: {
      businessName: String,
      businessLogo: String,
      email: {
        type: String,
        match: [EMAIL_REGEX, "Please enter a valid email"],
      },
      address: String,
      phone: String,
    },
    billTo: {
      clientName: String,
      email: {
        type: String,
        match: [EMAIL_REGEX, "Please enter a valid email"],
      },
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
    lastReceiptSentAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

InvoiceSchema.pre<IInvoice>("validate", function (next) {
  if (Array.isArray(this.items)) {
    this.items.forEach((item) => {
      const unitPrice = Number(item.unitPrice) || 0;
      const quantity = Number(item.quantity) || 0;
      const taxPercent = Number(item.taxPercent) || 0;
      item.total = unitPrice * quantity * (1 + taxPercent / 100);
    });
  }
  next();
});

InvoiceSchema.index({ user: 1, invoiceNumber: 1 }, { unique: true });

InvoiceSchema.index({ user: 1, createdAt: -1 });

InvoiceSchema.index({ user: 1, status: 1, createdAt: 1 });

const Invoice: Model<IInvoice> = mongoose.model<IInvoice>(
  "Invoice",
  InvoiceSchema,
);
export default Invoice;
