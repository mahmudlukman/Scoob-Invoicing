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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const CurrencySchema = new mongoose_1.Schema({
    code: { type: String, required: true },
    symbol: { type: String, required: true },
}, { _id: false });
// Item schema definition
const ItemSchema = new mongoose_1.Schema({
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
// Payment schema definition
const PaymentSchema = new mongoose_1.Schema({
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
// Invoice schema definition
const InvoiceSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, { timestamps: true });
InvoiceSchema.pre("validate", function (next) {
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
const Invoice = mongoose_1.default.model("Invoice", InvoiceSchema);
exports.default = Invoice;
