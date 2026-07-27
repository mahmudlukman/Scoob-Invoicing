"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeStatusFromPayments = exports.getInvoiceComputedFields = void 0;
const getInvoiceComputedFields = (invoice) => {
    const amountPaid = (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0);
    const total = invoice.total || 0;
    const balanceDue = Math.max(0, total - amountPaid);
    const isOverdue = invoice.status !== "Paid" &&
        !!invoice.dueDate &&
        new Date(invoice.dueDate) < new Date();
    return { amountPaid, balanceDue, isOverdue };
};
exports.getInvoiceComputedFields = getInvoiceComputedFields;
// Determines what status an invoice should have based on how much has been paid.
// Does NOT touch "Pending" — that's a manual/business-logic status you may use
// for drafts or awaiting-approval invoices, unrelated to payment amount.
const computeStatusFromPayments = (total, amountPaid, currentStatus) => {
    if (currentStatus === "Pending")
        return "Pending";
    if (amountPaid <= 0)
        return "Unpaid";
    if (amountPaid >= total)
        return "Paid";
    return "Partially Paid";
};
exports.computeStatusFromPayments = computeStatusFromPayments;
