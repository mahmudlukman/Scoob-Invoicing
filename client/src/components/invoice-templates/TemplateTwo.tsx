import { useEffect, useRef, useState } from "react";
import { addThousandsSeparator } from "../../utils/helper";
import type { InvoiceTemplateData, InvoiceItem } from "../../@types";

const DEFAULT_THEME = ["#EFF6FF", "#1D4ED8", "#DBEAFE", "#1E40AF", "#0F172A"];

interface InvoiceTemplateTwoProps {
  invoice: InvoiceTemplateData;
  colorPalette?: string[];
  containerWidth: number;
}

const TemplateTwo = ({
  invoice,
  colorPalette,
  containerWidth,
}: InvoiceTemplateTwoProps) => {
  const themeColors =
    (colorPalette ?? []).length > 0 ? colorPalette! : DEFAULT_THEME;

  const invoiceRef = useRef<HTMLDivElement>(null);
  const [baseWidth, setBaseWidth] = useState(800);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (invoiceRef.current) {
      const actualBaseWidth = invoiceRef.current.offsetWidth;
      setBaseWidth(actualBaseWidth);
      setScale(containerWidth / baseWidth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerWidth]);

  const statusColor =
    invoice.status === "Paid"
      ? "#16A34A"
      : invoice.status === "Pending"
        ? "#D97706"
        : "#DC2626";

  return (
    <div
      ref={invoiceRef}
      className="bg-white relative"
      style={{
        transform: containerWidth > 0 ? `scale(${scale})` : "none",
        transformOrigin: "top left",
        width: containerWidth > 0 ? `${baseWidth}px` : "auto",
        height: "auto",
        fontFamily: "'Trebuchet MS', sans-serif",
      }}
    >
      {/* Full-width dark header */}
      <div
        className="px-12 pt-10 pb-8"
        style={{ backgroundColor: themeColors[4] }}
      >
        <div className="flex items-start justify-between">
          {/* Business identity */}
          <div>
            {invoice.billFrom?.businessLogo ? (
              <img
                src={invoice.billFrom.businessLogo}
                alt="Business Logo"
                className="h-14 w-auto object-contain mb-3"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-lg font-bold"
                style={{
                  backgroundColor: `${themeColors[2]}20`,
                  color: themeColors[2],
                }}
              >
                {(invoice.billFrom?.businessName ?? "B")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <p
              className="text-2xl font-bold tracking-tight"
              style={{ color: themeColors[2] }}
            >
              {invoice.billFrom?.businessName ?? ""}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: `${themeColors[2]}99` }}
            >
              {invoice.billFrom?.address}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: `${themeColors[2]}80` }}
            >
              {invoice.billFrom?.email} · {invoice.billFrom?.phone}
            </p>
          </div>

          {/* Invoice number + status */}
          <div className="text-right">
            <p
              className="text-[10px] uppercase tracking-widest font-semibold mb-1"
              style={{ color: `${themeColors[2]}80` }}
            >
              Invoice
            </p>
            <p className="text-3xl font-bold" style={{ color: themeColors[2] }}>
              #{invoice.invoiceNumber}
            </p>
            <span
              className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                backgroundColor: `${statusColor}25`,
                color:
                  statusColor === "#16A34A"
                    ? "#4ADE80"
                    : statusColor === "#D97706"
                      ? "#FCD34D"
                      : "#FCA5A5",
              }}
            >
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div
          className="grid grid-cols-3 gap-6 mt-8 pt-6"
          style={{ borderTop: `1px solid ${themeColors[2]}20` }}
        >
          <div>
            <p
              className="text-[9px] uppercase tracking-widest mb-1"
              style={{ color: `${themeColors[2]}60` }}
            >
              Invoice Date
            </p>
            <p
              className="text-xs font-semibold"
              style={{ color: themeColors[2] }}
            >
              {new Date(invoice.invoiceDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p
              className="text-[9px] uppercase tracking-widest mb-1"
              style={{ color: `${themeColors[2]}60` }}
            >
              Due Date
            </p>
            <p
              className="text-xs font-semibold"
              style={{ color: themeColors[2] }}
            >
              {new Date(invoice.dueDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p
              className="text-[9px] uppercase tracking-widest mb-1"
              style={{ color: `${themeColors[2]}60` }}
            >
              Payment Terms
            </p>
            <p
              className="text-xs font-semibold"
              style={{ color: themeColors[2] }}
            >
              {invoice.paymentTerms}
            </p>
          </div>
        </div>
      </div>

      {/* Bill To band */}
      <div className="px-12 py-5" style={{ backgroundColor: themeColors[0] }}>
        <div className="flex items-start justify-between">
          <div>
            <p
              className="text-[9px] uppercase tracking-widest font-bold mb-1"
              style={{ color: themeColors[1] }}
            >
              Billed To
            </p>
            <p className="text-sm font-bold text-slate-800">
              {invoice.billTo?.clientName}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {invoice.billTo?.address}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {invoice.billTo?.email} · {invoice.billTo?.phone}
            </p>
          </div>

          {/* Total amount highlight */}
          <div
            className="text-right px-6 py-3 rounded-xl"
            style={{ backgroundColor: themeColors[2] }}
          >
            <p
              className="text-[9px] uppercase tracking-widest font-bold mb-1"
              style={{ color: themeColors[1] }}
            >
              Amount Due
            </p>
            <p className="text-2xl font-bold" style={{ color: themeColors[4] }}>
              ₦{addThousandsSeparator(invoice.total ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="px-12 py-8">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: themeColors[0] }}>
              <th
                className="px-4 py-3 text-left text-[10px] uppercase tracking-widest font-bold rounded-l-lg"
                style={{ color: themeColors[1] }}
              >
                Description
              </th>
              <th
                className="px-4 py-3 text-center text-[10px] uppercase tracking-widest font-bold"
                style={{ color: themeColors[1] }}
              >
                Qty
              </th>
              <th
                className="px-4 py-3 text-right text-[10px] uppercase tracking-widest font-bold"
                style={{ color: themeColors[1] }}
              >
                Unit Price
              </th>
              <th
                className="px-4 py-3 text-right text-[10px] uppercase tracking-widest font-bold rounded-r-lg"
                style={{ color: themeColors[1] }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item: InvoiceItem, index: number) => (
              <tr key={index} className="border-b border-slate-100">
                <td className="px-4 py-3 text-sm font-medium text-slate-800">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-center text-sm text-slate-500">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-500">
                  ₦{addThousandsSeparator(item.unitPrice)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                  ₦
                  {addThousandsSeparator(
                    item.total ??
                      item.quantity *
                        item.unitPrice *
                        (1 + (item.taxPercent ?? 0) / 100),
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mt-6">
          <div className="w-60">
            <div className="flex justify-between py-1.5 text-xs text-slate-500">
              <span>Subtotal</span>
              <span>₦{addThousandsSeparator(invoice.subtotal ?? 0)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-xs text-slate-500">
              <span>Tax</span>
              <span>₦{addThousandsSeparator(invoice.taxTotal ?? 0)}</span>
            </div>
            <div
              className="flex justify-between py-3 px-4 mt-2 rounded-xl text-sm font-bold"
              style={{
                backgroundColor: themeColors[4],
                color: themeColors[2],
              }}
            >
              <span>Total Due</span>
              <span>₦{addThousandsSeparator(invoice.total ?? 0)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div
            className="mt-8 p-5 rounded-xl"
            style={{ backgroundColor: themeColors[0] }}
          >
            <p
              className="text-[9px] uppercase tracking-widest font-bold mb-2"
              style={{ color: themeColors[1] }}
            >
              Notes
            </p>
            <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
              {invoice.notes}
            </p>
          </div>
        )}
      </div>
      {/* PAID watermark */}
      {invoice.status === "Paid" && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 10 }}
        >
          <span
            className="text-[160px] font-black uppercase tracking-widest select-none"
            style={{
              color: themeColors[1],
              opacity: 0.08,
              transform: "rotate(-35deg)",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            PAID
          </span>
        </div>
      )}
    </div>
  );
};

export default TemplateTwo;
