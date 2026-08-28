import { useEffect, useRef, useState } from "react";
import { Copy, Edit, EllipsisVertical, Mail, Trash2 } from "lucide-react";
import type { Invoice } from "../../@types";

interface InvoiceActionsDropdownProps {
  invoice: Invoice;
  isDuplicating?: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onReminder: () => void;
  onDelete: () => void;
}

const InvoiceActionsDropdown = ({
  invoice,
  isDuplicating = false,
  onEdit,
  onDuplicate,
  onReminder,
  onDelete,
}: InvoiceActionsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-label={`Actions for ${invoice.invoiceNumber}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((previous) => !previous);
        }}
        className={`
          inline-flex h-9 w-9 items-center justify-center rounded-lg
          text-slate-500 transition-colors
          hover:bg-slate-100 hover:text-slate-900
          focus:outline-none focus:ring-2 focus:ring-blue-500/20
          ${isOpen ? "bg-slate-100 text-slate-900" : ""}
        `}
      >
        <EllipsisVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="
            absolute right-0 z-50 mt-2 w-48 origin-top-right
            rounded-lg border border-slate-200 bg-white
            py-1 shadow-lg ring-1 ring-black/5
          "
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => handleAction(onEdit)}
            className="
              flex w-full items-center gap-3 px-3 py-2.5
              text-sm text-slate-700 transition-colors
              hover:bg-slate-50
            "
          >
            <Edit className="h-4 w-4 text-slate-500" />
            <span>Edit Invoice</span>
          </button>

          <button
            type="button"
            role="menuitem"
            disabled={isDuplicating}
            onClick={() => handleAction(onDuplicate)}
            className="
              flex w-full items-center gap-3 px-3 py-2.5
              text-sm text-slate-700 transition-colors
              hover:bg-slate-50
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            <Copy className="h-4 w-4 text-violet-500" />
            <span>
              {isDuplicating ? "Duplicating..." : "Duplicate Invoice"}
            </span>
          </button>

          {invoice.status !== "Paid" && (
            <button
              type="button"
              role="menuitem"
              onClick={() => handleAction(onReminder)}
              className="
                flex w-full items-center gap-3 px-3 py-2.5
                text-sm text-slate-700 transition-colors
                hover:bg-slate-50
              "
            >
              <Mail className="h-4 w-4 text-blue-500" />
              <span>Generate Reminder</span>
            </button>
          )}

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            role="menuitem"
            onClick={() => handleAction(onDelete)}
            className="
              flex w-full items-center gap-3 px-3 py-2.5
              text-sm text-red-600 transition-colors
              hover:bg-red-50
            "
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Invoice</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default InvoiceActionsDropdown;
