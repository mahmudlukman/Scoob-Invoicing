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

export interface User {
  _id: string;
  name: string;
  email: string;
  businessLogo?: BusinessLogo;
  businessName: string;
  address: string;
  phone: string;
  role: string;
  isActive?: boolean;
}

export interface ServerError {
  status?: number;
  data?: {
    message?: string;
  };
  message?: string;
}

export interface Invoice {
  _id: string;
  status: string;
  total: number;
  invoiceDate: string;
  dueDate: string;
  invoiceNumber: string;
  billTo: {
    clientName: string;
  };
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
}

export interface InvoiceFormData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  billFrom: BillInfo;
  billTo: BillInfo;
  items: InvoiceItem[];
  notes: string;
  paymentTerms: string;
  subtotal?: number;
  taxTotal?: number;
  total?: number;
}