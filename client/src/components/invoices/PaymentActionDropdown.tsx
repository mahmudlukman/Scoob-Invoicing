import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, CheckCircle2, Banknote } from "lucide-react";
import Button from "../ui/Button";
import type { Invoice } from "../../@types";

interface PaymentActionDropdownProps {
  invoice: Invoice;
  isProcessing?: boolean;
  onFullPayment: () => void;
  onPartialPayment: () => void;
}

const PaymentActionDropdown = ({
  invoice,
  isProcessing,
  onFullPayment,
  onPartialPayment,
}: PaymentActionDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const MENU_WIDTH = 192; // matches w-48

  const calculatePosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Align menu's right edge with button's right edge, flip if it would go off-screen
    let left = rect.right - MENU_WIDTH;
    if (left < 8) left = rect.left; // fallback: align left edge if flush right overflows viewport

    setMenuPosition({
      top: rect.bottom + window.scrollY + 4,
      left: left + window.scrollX,
    });
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

    // Recalculate on scroll/resize so the menu tracks the button if the table scrolls
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

  if (invoice.status === "Paid") return null;

  return (
    <div className="relative inline-block" ref={buttonRef}>
      <Button
        size="small"
        variant="secondary"
        onClick={handleToggle}
        isLoading={isProcessing}
      >
        <span className="flex items-center gap-1">
          Mark Paid
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
                onFullPayment();
              }}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <span className="block font-medium">Full Payment</span>
                <span className="block text-xs text-slate-400">
                  Record entire balance
                </span>
              </span>
            </button>
            <button
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
              onClick={() => {
                setOpen(false);
                onPartialPayment();
              }}
            >
              <Banknote className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                <span className="block font-medium">Partial Payment</span>
                <span className="block text-xs text-slate-400">
                  Enter a custom amount
                </span>
              </span>
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default PaymentActionDropdown;
