export interface RootState {
  auth: {
    user: User | null;
  };
}

export interface BusinessLogo {
  public_id: string;
  url: string;
  _id: string;
}

export interface InvoiceColorPalette {
  primary: string;
  secondary: string;
  background: string;
}

export interface InvoicePreferences {
  templateId: string;
  paletteId: string;
  colorPalette: InvoiceColorPalette;
}

export interface Currency {
  code: string;
  symbol: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  businessLogo?: BusinessLogo;
  businessName: string;
  defaultCurrency?: Currency;
  address: string;
  phone: string;
  role: string;
  isActive?: boolean;
  invoicePreferences?: InvoicePreferences;
  createdAt: string;
}

export interface ServerError {
  status?: number;
  data?: {
    message?: string;
  };
  message?: string;
}

export interface Payment {
  _id: string;
  amount: number;
  date: string;
  method?: string;
  note?: string;
}

export interface Invoice {
  _id: string;
  status: "Paid" | "Unpaid" | "Pending" | "Partially Paid";
  total: number;
  subtotal: number;
  taxTotal: number;
  currency: Currency;
  invoiceDate: string;
  dueDate: string;
  invoiceNumber: string;
  paymentTerms: string;
  notes?: string;
  items: InvoiceItem[];
  billFrom: BillInfo;
  billTo: BillInfo;
  payments: Payment[];
  amountPaid: number;
  balanceDue: number;
  isOverdue: boolean;
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  total?: number;
}

export interface BillInfo {
  businessName?: string;
  clientName?: string;
  email: string;
  address: string;
  phone: string;
  businessLogo?: string;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency?: Currency;
  billFrom: BillInfo;
  billTo: BillInfo;
  items: InvoiceItem[];
  notes: string;
  paymentTerms: string;
  subtotal?: number;
  taxTotal?: number;
  total?: number;
  status?: "Paid" | "Unpaid" | "Pending" | "Partially Paid";
  saveCustomer?: boolean;
}

export type InvoiceTemplateData = Invoice | InvoiceFormData;
