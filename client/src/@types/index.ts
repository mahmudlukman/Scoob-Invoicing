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
  invoicePreferences?: InvoicePreferences;
  createdAt: string;
}

// export interface User {
//   _id: string;
//   name: string;
//   email: string;
//   businessLogo?: BusinessLogo;
//   businessName: string;
//   address: string;
//   phone: string;
//   role: string;
//   isActive?: boolean;
// }

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
  subtotal: number;
  taxTotal: number;
  invoiceDate: string;
  dueDate: string;
  invoiceNumber: string;
  paymentTerms: string;
  notes?: string;
  items: InvoiceItem[];
  billFrom: BillInfo;
  billTo: BillInfo;
}

// export interface Invoice {
//   _id: string;
//   status: string;
//   total: number;
//   invoiceDate: string;
//   dueDate: string;
//   invoiceNumber: string;
//   billTo: {
//     clientName: string;
//   };
// }

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
  billFrom: BillInfo;
  billTo: BillInfo;
  items: InvoiceItem[];
  notes: string;
  paymentTerms: string;
  subtotal?: number;
  taxTotal?: number;
  total?: number;
  status?: string;
}

export type InvoiceTemplateData = Invoice | InvoiceFormData;
