import { useEffect, useRef, useState } from "react";
import { addThousandsSeparator } from "../../utils/helper";
import {
  getPaymentInfo,
  getStatusColor,
  getCurrencySymbol,
} from "../../utils/invoiceHelpers";
import type { InvoiceTemplateData, InvoiceItem } from "../../@types";

const DEFAULT_THEME = ["#FAFAF9", "#D97706", "#FEF3C7", "#92400E", "#1C1917"];

interface InvoiceTemplateThreeProps {
  invoice: InvoiceTemplateData;
  colorPalette?: string[];
  containerWidth: number;
}

const TemplateThree = ({
  invoice,
  colorPalette,
  containerWidth,
}: InvoiceTemplateThreeProps) => {
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

  const statusColor = getStatusColor(invoice.status);
  const { amountPaid, balanceDue } = getPaymentInfo(invoice);
  const currencySymbol = getCurrencySymbol(invoice);
  const isPartiallyPaid = invoice.status === "Partially Paid";

  return (
    <div
      ref={invoiceRef}
      className="relative"
      style={{
        transform: containerWidth > 0 ? `scale(${scale})` : "none",
        transformOrigin: "top left",
        width: containerWidth > 0 ? `${baseWidth}px` : "auto",
        height: "auto",
        backgroundColor: themeColors[0],
        fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
      }}
    >
      <div className="flex min-h-full">
        {/* Left accent bar */}
        <div
          className="w-2 shrink-0"
          style={{ backgroundColor: themeColors[1] }}
        />

        <div className="flex-1 px-10 py-10">
          {/* Top: business logo/name + invoice label */}
          <div
            className="flex items-end justify-between border-b-2 pb-6 mb-8"
            style={{ borderColor: themeColors[1] }}
          >
            <div>
              {invoice.billFrom?.businessLogo ? (
                <img
                  src={invoice.billFrom.businessLogo}
                  alt="Business Logo"
                  className="h-14 w-auto object-contain mb-2"
                />
              ) : null}
              <p
                className="text-3xl font-bold tracking-tight leading-none"
                style={{ color: themeColors[4] }}
              >
                {invoice.billFrom?.businessName ?? ""}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {invoice.billFrom?.address} · {invoice.billFrom?.email} ·{" "}
                {invoice.billFrom?.phone}
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-[10px] uppercase tracking-[0.25em] font-semibold"
                style={{ color: themeColors[1] }}
              >
                Invoice
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: themeColors[4] }}
              >
                #{invoice.invoiceNumber}
              </p>
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${statusColor}15`,
                  color: statusColor,
                }}
              >
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Bill to / dates / amount row */}
          <div className="grid grid-cols-3 gap-8 mb-10">
            <div>
              <p
                className="text-[9px] uppercase tracking-[0.2em] font-bold mb-2"
                style={{ color: themeColors[1] }}
              >
                Billed To
              </p>
              <p className="text-sm font-bold text-slate-800">
                {invoice.billTo?.clientName}
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {invoice.billTo?.address}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {invoice.billTo?.email}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {invoice.billTo?.phone}
              </p>
            </div>

            <div>
              <p
                className="text-[9px] uppercase tracking-[0.2em] font-bold mb-2"
                style={{ color: themeColors[1] }}
              >
                Invoice Date
              </p>
              <p className="text-sm font-medium text-slate-700">
                {new Date(invoice.invoiceDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p
                className="text-[9px] uppercase tracking-[0.2em] font-bold mt-4 mb-2"
                style={{ color: themeColors[1] }}
              >
                Due Date
              </p>
              <p className="text-sm font-medium text-slate-700">
                {new Date(invoice.dueDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div>
              <p
                className="text-[9px] uppercase tracking-[0.2em] font-bold mb-2"
                style={{ color: themeColors[1] }}
              >
                Payment Terms
              </p>
              <p className="text-sm font-medium text-slate-700">
                {invoice.paymentTerms}
              </p>
              <div
                className="mt-5 px-4 py-3 rounded-lg"
                style={{ backgroundColor: themeColors[2] }}
              >
                <p
                  className="text-[9px] uppercase tracking-widest font-bold"
                  style={{ color: themeColors[3] }}
                >
                  {isPartiallyPaid ? "Balance Due" : "Total Due"}
                </p>
                <p
                  className="text-xl font-bold mt-0.5"
                  style={{ color: themeColors[4] }}
                >
                  {currencySymbol}
                  {addThousandsSeparator(
                    isPartiallyPaid ? balanceDue : (invoice.total ?? 0),
                  )}
                </p>
                {isPartiallyPaid && (
                  <p
                    className="text-[10px] mt-1"
                    style={{ color: themeColors[3] }}
                  >
                    {currencySymbol}
                    {addThousandsSeparator(amountPaid)} paid so far
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items table */}
          <table className="w-full">
            <thead>
              <tr>
                <th
                  className="py-2.5 text-left text-[9px] uppercase tracking-[0.2em] font-bold"
                  style={{
                    color: themeColors[1],
                    borderBottom: `1px solid ${themeColors[1]}`,
                  }}
                >
                  Item
                </th>
                <th
                  className="py-2.5 text-center text-[9px] uppercase tracking-[0.2em] font-bold"
                  style={{
                    color: themeColors[1],
                    borderBottom: `1px solid ${themeColors[1]}`,
                  }}
                >
                  Qty
                </th>
                <th
                  className="py-2.5 text-right text-[9px] uppercase tracking-[0.2em] font-bold"
                  style={{
                    color: themeColors[1],
                    borderBottom: `1px solid ${themeColors[1]}`,
                  }}
                >
                  Rate
                </th>
                <th
                  className="py-2.5 text-right text-[9px] uppercase tracking-[0.2em] font-bold"
                  style={{
                    color: themeColors[1],
                    borderBottom: `1px solid ${themeColors[1]}`,
                  }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item: InvoiceItem, index: number) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor:
                      index % 2 === 0 ? "transparent" : `${themeColors[2]}50`,
                  }}
                >
                  <td className="py-3 text-sm text-slate-800 font-medium">
                    {item.name}
                  </td>
                  <td className="py-3 text-center text-sm text-slate-500">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-sm text-slate-500">
                    {currencySymbol}
                    {addThousandsSeparator(item.unitPrice)}
                  </td>
                  <td className="py-3 text-right text-sm font-semibold text-slate-800">
                    {currencySymbol}
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

          {/* Summary */}
          <div className="flex justify-end mt-6">
            <div className="w-52 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span>
                  {currencySymbol}
                  {addThousandsSeparator(invoice.subtotal ?? 0)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Tax</span>
                <span>
                  {currencySymbol}
                  {addThousandsSeparator(invoice.taxTotal ?? 0)}
                </span>
              </div>
              <div
                className="flex justify-between text-sm font-bold pt-2"
                style={{
                  borderTop: `2px solid ${themeColors[1]}`,
                  color: themeColors[4],
                }}
              >
                <span>Total</span>
                <span style={{ color: themeColors[1] }}>
                  {currencySymbol}
                  {addThousandsSeparator(invoice.total ?? 0)}
                </span>
              </div>

              {isPartiallyPaid && (
                <div
                  className="pt-2 mt-1 space-y-1"
                  style={{ borderTop: `1px dashed ${themeColors[1]}60` }}
                >
                  <div
                    className="flex justify-between text-xs font-medium"
                    style={{ color: themeColors[1] }}
                  >
                    <span>Paid</span>
                    <span>
                      {currencySymbol}
                      {addThousandsSeparator(amountPaid)}
                    </span>
                  </div>
                  <div
                    className="flex justify-between text-xs font-bold"
                    style={{ color: themeColors[4] }}
                  >
                    <span>Balance</span>
                    <span>
                      {currencySymbol}
                      {addThousandsSeparator(balanceDue)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div
              className="mt-10 pt-6"
              style={{ borderTop: `1px dashed ${themeColors[1]}80` }}
            >
              <p
                className="text-[9px] uppercase tracking-[0.2em] font-bold mb-2"
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
      {/* PAID / PARTIALLY PAID watermark */}
      {(invoice.status === "Paid" || isPartiallyPaid) && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 10 }}
        >
          <span
            className="font-black uppercase tracking-widest select-none"
            style={{
              color: themeColors[1],
              opacity: 0.08,
              transform: "rotate(-35deg)",
              lineHeight: 1,
              userSelect: "none",
              fontSize: isPartiallyPaid ? "90px" : "160px",
            }}
          >
            {invoice.status === "Paid" ? "PAID" : "PARTIALLY PAID"}
          </span>
        </div>
      )}
    </div>
  );
};

export default TemplateThree;
