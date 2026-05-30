import { useEffect, useRef, useState } from "react";
import { addThousandsSeparator } from "../../utils/helper";
import type { InvoiceTemplateData, InvoiceItem } from "../../@types";

const DEFAULT_THEME = ["#F0FDF4", "#16A34A", "#DCFCE7", "#15803D", "#1E293B"];

interface InvoiceTemplateOneProps {
  invoice: InvoiceTemplateData;
  colorPalette?: string[];
  containerWidth: number;
}

const TemplateOne = ({
  invoice,
  colorPalette,
  containerWidth,
}: InvoiceTemplateOneProps) => {
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
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* Top accent strip */}
      <div className="h-2 w-full" style={{ backgroundColor: themeColors[1] }} />

      <div className="grid grid-cols-12">
        {/* Left sidebar */}
        <div
          className="col-span-4 min-h-full px-8 py-10"
          style={{ backgroundColor: themeColors[0] }}
        >
          {/* Logo / Business Name */}
          <div className="mb-10">
            {invoice.billFrom?.businessLogo ? (
              <img
                src={invoice.billFrom.businessLogo}
                alt="Business Logo"
                className="h-14 w-auto object-contain mb-3"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-white text-xl font-bold"
                style={{ backgroundColor: themeColors[1] }}
              >
                {(invoice.billFrom?.businessName ?? "B")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: themeColors[1] }}
            >
              Invoice
            </p>
            <p
              className="text-lg font-bold mt-1 leading-tight"
              style={{ color: themeColors[4] }}
            >
              {invoice.billFrom?.businessName ?? ""}
            </p>
          </div>

          {/* From */}
          <div className="mb-8">
            <p
              className="text-[9px] uppercase tracking-widest font-bold mb-3"
              style={{ color: themeColors[1] }}
            >
              From
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              {invoice.billFrom?.address}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {invoice.billFrom?.email}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {invoice.billFrom?.phone}
            </p>
          </div>

          {/* To */}
          <div className="mb-8">
            <p
              className="text-[9px] uppercase tracking-widest font-bold mb-3"
              style={{ color: themeColors[1] }}
            >
              Billed To
            </p>
            <p className="text-xs font-semibold text-slate-800">
              {invoice.billTo?.clientName}
            </p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {invoice.billTo?.address}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {invoice.billTo?.email}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {invoice.billTo?.phone}
            </p>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <div>
              <p
                className="text-[9px] uppercase tracking-widest font-bold mb-1"
                style={{ color: themeColors[1] }}
              >
                Invoice Date
              </p>
              <p className="text-xs text-slate-700">
                {new Date(invoice.invoiceDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p
                className="text-[9px] uppercase tracking-widest font-bold mb-1"
                style={{ color: themeColors[1] }}
              >
                Due Date
              </p>
              <p className="text-xs text-slate-700">
                {new Date(invoice.dueDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p
                className="text-[9px] uppercase tracking-widest font-bold mb-1"
                style={{ color: themeColors[1] }}
              >
                Payment Terms
              </p>
              <p className="text-xs text-slate-700">{invoice.paymentTerms}</p>
            </div>
          </div>
        </div>

        {/* Right main content */}
        <div className="col-span-8 px-8 py-10">
          {/* Header row */}
          <div className="flex items-start justify-between mb-10">
            <h1
              className="text-4xl font-bold tracking-tight"
              style={{ color: themeColors[4] }}
            >
              #
              <span style={{ color: themeColors[1] }}>
                {invoice.invoiceNumber}
              </span>
            </h1>
            <span
              className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                backgroundColor: `${statusColor}18`,
                color: statusColor,
              }}
            >
              {invoice.status}
            </span>
          </div>

          {/* Items table */}
          <table className="w-full mb-8">
            <thead>
              <tr style={{ borderBottom: `2px solid ${themeColors[1]}` }}>
                <th
                  className="pb-2 text-left text-[10px] uppercase tracking-widest font-bold"
                  style={{ color: themeColors[1] }}
                >
                  Description
                </th>
                <th
                  className="pb-2 text-center text-[10px] uppercase tracking-widest font-bold"
                  style={{ color: themeColors[1] }}
                >
                  Qty
                </th>
                <th
                  className="pb-2 text-right text-[10px] uppercase tracking-widest font-bold"
                  style={{ color: themeColors[1] }}
                >
                  Unit Price
                </th>
                <th
                  className="pb-2 text-right text-[10px] uppercase tracking-widest font-bold"
                  style={{ color: themeColors[1] }}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item: InvoiceItem, index: number) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="py-3 text-sm font-medium text-slate-800">
                    {item.name}
                  </td>
                  <td className="py-3 text-center text-sm text-slate-600">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-sm text-slate-600">
                    ₦{addThousandsSeparator(item.unitPrice)}
                  </td>
                  <td className="py-3 text-right text-sm font-semibold text-slate-800">
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
          <div className="flex justify-end">
            <div className="w-56 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span>₦{addThousandsSeparator(invoice.subtotal ?? 0)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Tax</span>
                <span>₦{addThousandsSeparator(invoice.taxTotal ?? 0)}</span>
              </div>
              <div
                className="flex justify-between text-sm font-bold pt-2 mt-2"
                style={{
                  borderTop: `2px solid ${themeColors[1]}`,
                  color: themeColors[4],
                }}
              >
                <span>Total Due</span>
                <span style={{ color: themeColors[1] }}>
                  ₦{addThousandsSeparator(invoice.total ?? 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-10 pt-6 border-t border-slate-100">
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
      </div>

      {/* Bottom accent strip */}
      <div className="h-1 w-full" style={{ backgroundColor: themeColors[2] }} />
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

export default TemplateOne;
