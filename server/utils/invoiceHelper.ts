import { IInvoice } from "../models/Invoice";

export const getInvoiceComputedFields = (invoice: IInvoice) => {
  const amountPaid = (invoice.payments || []).reduce(
    (sum, p) => sum + p.amount,
    0,
  );
  const total = invoice.total || 0;
  const balanceDue = Math.max(0, total - amountPaid);

  const isOverdue =
    invoice.status !== "Paid" &&
    !!invoice.dueDate &&
    new Date(invoice.dueDate) < new Date();

  return { amountPaid, balanceDue, isOverdue };
};

// Determines what status an invoice should have based on how much has been paid.
// Does NOT touch "Pending" — that's a manual/business-logic status you may use
// for drafts or awaiting-approval invoices, unrelated to payment amount.
export const computeStatusFromPayments = (
  total: number,
  amountPaid: number,
  currentStatus: IInvoice["status"],
): IInvoice["status"] => {
  if (currentStatus === "Pending") return "Pending";

  if (amountPaid <= 0) return "Unpaid";
  if (amountPaid >= total) return "Paid";
  return "Partially Paid";
};
