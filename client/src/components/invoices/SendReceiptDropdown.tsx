import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReactToPrint } from "react-to-print";
import { ChevronDown, Mail, Download, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import InputField from "../ui/InputField";
import { useSendReceiptMutation } from "../../redux/features/invoice/invoiceApi";
import type { Invoice, ServerError } from "../../@types";
import PaymentReceipt from "./PaymentReceipt";

interface SendReceiptDropdownProps {
  invoice: Invoice;
}

const SendReceiptDropdown = ({ invoice }: SendReceiptDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [email, setEmail] = useState(invoice.billTo?.email || "");
  const [sendReceipt, { isLoading: isSending }] = useSendReceiptMutation();

  const wasSent = Boolean(invoice.lastReceiptSentAt);

  const MENU_WIDTH = 200;

  const calculatePosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    let left = rect.right - MENU_WIDTH;
    if (left < 8) left = rect.left;
    setMenuPosition({ top: rect.bottom + window.scrollY + 4, left: left + window.scrollX });
  };

  const handleToggle = () => {
    if (!open) calculatePosition();
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleReposition = () => calculatePosition();
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open]);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${invoice.invoiceNumber}`,
    pageStyle: `
      @page { size: A4; margin: 0; }
      html, body {
        height: 100%;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        color-adjust: exact;
      }
    `,
  });

  const handleSendEmail = async () => {
    if (!email) {
      toast.error("Enter a recipient email");
      return;
    }
    try {
      await sendReceipt({ invoiceId: invoice._id, email }).unwrap();
      toast.success("Receipt sent");
      setEmailModalOpen(false);
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError.data?.message || serverError.message || "Failed to send receipt",
      );
    }
  };

  return (
    <>
      {/* Hidden receipt used only as the print source */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div ref={receiptRef}>
          <PaymentReceipt invoice={invoice} />
        </div>
      </div>

      <div className="relative inline-block" ref={buttonRef}>
        <Button
          size="small"
          variant={wasSent ? "ghost" : "secondary"}
          onClick={handleToggle}
        >
          <span className="flex items-center gap-1.5">
            {wasSent ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Receipt Sent</span>
              </>
            ) : (
              "Send Receipt"
            )}
            <ChevronDown className="w-3.5 h-3.5" />
          </span>
        </Button>

        {open &&
          createPortal(
            <div
              ref={menuRef}
              style={{
                position: "absolute",
                top: menuPosition.top,
                left: menuPosition.left,
                width: MENU_WIDTH,
              }}
              className="z-[9999] bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden"
            >
              <button
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                onClick={() => {
                  setOpen(false);
                  setEmailModalOpen(true);
                }}
              >
                <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                {wasSent ? "Resend Email" : "Email Receipt"}
              </button>
              <button
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
                onClick={() => {
                  setOpen(false);
                  handlePrint();
                }}
              >
                <Download className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                Download PDF
              </button>
            </div>,
            document.body,
          )}
      </div>

      <Modal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        title={wasSent ? "Resend Receipt" : "Email Receipt"}
      >
        <div className="p-6 space-y-4 w-full max-w-md">
          {wasSent && invoice.lastReceiptSentAt && (
            <p className="text-xs text-slate-500">
              Last sent{" "}
              {new Date(invoice.lastReceiptSentAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
          <InputField
            label="Recipient Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEmailModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} isLoading={isSending}>
              {wasSent ? "Resend" : "Send"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SendReceiptDropdown;