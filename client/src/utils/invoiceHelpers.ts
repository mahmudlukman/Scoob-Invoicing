import type { InvoiceTemplateData } from "../@types";

export const getPaymentInfo = (invoice: InvoiceTemplateData) => {
  const amountPaid = "amountPaid" in invoice ? (invoice.amountPaid ?? 0) : 0;
  const balanceDue =
    "balanceDue" in invoice
      ? (invoice.balanceDue ?? invoice.total ?? 0)
      : (invoice.total ?? 0);
  return { amountPaid, balanceDue };
};

export const getStatusColor = (status?: string) =>
  status === "Paid"
    ? "#16A34A"
    : status === "Partially Paid"
      ? "#2563EB"
      : status === "Pending"
        ? "#D97706"
        : "#DC2626";

export const getCurrencySymbol = (invoice: InvoiceTemplateData) =>
  invoice.currency?.symbol || "₦";
