import { format } from "date-fns";
import { addThousandsSeparator } from "../../utils/helper";
import type { Invoice } from "../../@types";

interface PaymentReceiptProps {
  invoice: Invoice;
}

const PaymentReceipt = ({ invoice }: PaymentReceiptProps) => {
  const currencySymbol = invoice.currency?.symbol || "₦";
  const lastPayment = invoice.payments?.[invoice.payments.length - 1];

  return (
    <div
      className="bg-white mx-auto"
      style={{
        width: "600px",
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        color: "#1e293b",
      }}
    >
      <div className="px-10 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
              Receipt
            </p>
            <p className="text-2xl font-bold mt-1">
              {invoice.billFrom?.businessName}
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-800">
            Paid
          </span>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Received from
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {invoice.billTo?.clientName}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {invoice.billTo?.email}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Invoice
            </p>
            <p className="text-sm font-semibold text-slate-800">
              #{invoice.invoiceNumber}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-emerald-50 px-6 py-5 mb-8">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium text-emerald-800">
              Amount Paid
            </span>
            <span className="text-2xl font-bold text-emerald-900 tabular-nums">
              {currencySymbol}
              {addThousandsSeparator(invoice.total)}
            </span>
          </div>
        </div>

        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-3 text-slate-500">Payment Date</td>
              <td className="py-3 text-right font-medium tabular-nums">
                {lastPayment
                  ? format(new Date(lastPayment.date), "MMM d, yyyy")
                  : "—"}
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-3 text-slate-500">Payment Method</td>
              <td className="py-3 text-right font-medium">
                {lastPayment?.method || "—"}
              </td>
            </tr>
            <tr>
              <td className="py-3 text-slate-500">Total Payments Logged</td>
              <td className="py-3 text-right font-medium">
                {invoice.payments?.length || 0}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="text-xs text-slate-400 mt-10 pt-6 border-t border-slate-100">
          This receipt confirms full payment of invoice #{invoice.invoiceNumber}{" "}
          issued by {invoice.billFrom?.businessName}. Thank you for your
          business.
        </p>
      </div>
    </div>
  );
};

export default PaymentReceipt;
