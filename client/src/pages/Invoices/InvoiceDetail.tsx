import {
  AlertCircle,
  Edit,
  Mail,
  Paintbrush,
  Printer,
  Trash2,
  Loader2,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import Button from "../../components/ui/Button";
import CreateInvoice from "./CreateInvoice";
import ReminderModel from "../../components/invoices/ReminderModel";
import LogPaymentModal from "../../components/invoices/LogPaymentModal";
import {
  useGetInvoiceQuery,
  useUpdateInvoiceMutation,
  useDeletePaymentMutation,
  useAddPaymentMutation,
} from "../../redux/features/invoice/invoiceApi";
import type {
  InvoiceFormData,
  Payment,
  RootState,
  ServerError,
} from "../../@types";
import Loading from "../../components/ui/Loading";
import { useReactToPrint } from "react-to-print";
import RenderInvoice from "../../components/invoice-templates/RenderInvoice";
import { addThousandsSeparator } from "../../utils/helper";
import PaymentActionDropdown from "../../components/invoices/PaymentActionDropdown";

const INVOICE_WIDTH = 680;

const DEFAULT_PALETTE = {
  primary: "#16A34A",
  secondary: "#15803D",
  background: "#F0FDF4",
};

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [addPayment] = useAddPaymentMutation();
  const [isFullPaymentLoading, setIsFullPaymentLoading] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  const templateId = user?.invoicePreferences?.templateId ?? "01";
  const colorPalette =
    user?.invoicePreferences?.colorPalette ?? DEFAULT_PALETTE;

  const { data: invoiceResponse, isLoading, isError } = useGetInvoiceQuery(id);
  const [updateInvoice] = useUpdateInvoiceMutation();
  const [deletePayment, { isLoading: isDeletingPayment }] =
    useDeletePaymentMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isLogPaymentOpen, setIsLogPaymentOpen] = useState(false);
  const [deletePaymentModal, setDeletePaymentModal] = useState<{
    open: boolean;
    paymentId: string | null;
  }>({ open: false, paymentId: null });

  const invoice = invoiceResponse?.invoice || invoiceResponse;

  // Handles responsive scaling/height calculations safely without render cycle leaks
  useEffect(() => {
    if (isEditing) return;
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const handleResize = () => {
      const containerWidth = container.clientWidth ?? INVOICE_WIDTH;
      const scale = Math.min(1, containerWidth / INVOICE_WIDTH);

      inner.style.setProperty("--preview-scale", String(scale));

      // Force parent wrapper height to map exact scaled canvas matrix bounds
      const naturalHeight = inner.scrollHeight;
      container.style.height = `${naturalHeight * scale}px`;
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [invoice, templateId, isEditing]);

  const handleUpdate = async (formData: InvoiceFormData) => {
    try {
      await updateInvoice({ id, data: formData }).unwrap();
      toast.success("Invoice updated successfully!");
      setIsEditing(false);
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError?.data?.message ||
          serverError?.message ||
          "Failed to update Invoice",
      );
    }
  };

  const handleDeletePayment = async () => {
    if (!deletePaymentModal.paymentId || !id) return;

    try {
      await deletePayment({
        invoiceId: id,
        paymentId: deletePaymentModal.paymentId,
      }).unwrap();
      toast.success("Payment removed");
      setDeletePaymentModal({ open: false, paymentId: null });
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError?.data?.message ||
          serverError?.message ||
          "Failed to remove payment",
      );
    }
  };

  const handleFullPayment = async () => {
    if (!id || !invoice) return;
    setIsFullPaymentLoading(true);
    try {
      await addPayment({
        invoiceId: id,
        data: {
          amount: invoice.balanceDue,
          method: "Full Payment",
        },
      }).unwrap();
      toast.success("Invoice marked as fully paid");
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError?.data?.message ||
          serverError?.message ||
          "Failed to record payment",
      );
    } finally {
      setIsFullPaymentLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice-${invoice?.invoiceNumber}`,
  });

  if (isLoading) return <Loading />;

  if (isError || !invoice || !invoice.billFrom || !invoice.billTo) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Invoice Not Found
        </h3>
        <p className="text-slate-500 mb-6 max-w-md">
          The invoice you are looking for does not exist or could not be loaded.
        </p>
        <Button onClick={() => navigate("/invoices")}>
          Back to All Invoices
        </Button>
      </div>
    );
  }

  if (isEditing) {
    return <CreateInvoice existingInvoice={invoice} onSave={handleUpdate} />;
  }

  // Merge the business logo URL from the user profile into billFrom
  const invoiceWithLogo = {
    ...invoice,
    billFrom: {
      ...invoice.billFrom,
      businessLogo: user?.businessLogo?.url,
    },
  };

  const payments = invoice.payments || [];
  const amountPaid = invoice.amountPaid ?? 0;
  const balanceDue = invoice.balanceDue ?? invoice.total;

  return (
    <>
      <ReminderModel
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        invoiceId={id!}
      />
      <LogPaymentModal
        key={id}
        isOpen={isLogPaymentOpen}
        onClose={() => setIsLogPaymentOpen(false)}
        invoiceId={id ?? null}
        balanceDue={balanceDue}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 print:hidden gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Invoice{" "}
            <span className="font-mono text-slate-500">
              {invoice.invoiceNumber}
            </span>
          </h1>
          {invoice.isOverdue && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
              Overdue
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {invoice.status !== "Paid" && (
            <PaymentActionDropdown
              invoice={invoice}
              isProcessing={isFullPaymentLoading}
              onFullPayment={handleFullPayment}
              onPartialPayment={() => setIsLogPaymentOpen(true)}
            />
          )}
          {invoice.status !== "Paid" && (
            <Button
              variant="secondary"
              onClick={() => setIsReminderModalOpen(true)}
              icon={Mail}
            >
              Generate Reminder
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => navigate("/invoice/customize")}
            icon={Paintbrush}
          >
            Customize
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsEditing(true)}
            icon={Edit}
          >
            Edit
          </Button>
          <Button
            variant="primary"
            onClick={() => handlePrint()}
            icon={Printer}
          >
            Print or Download
          </Button>
        </div>
      </div>

      <div className="bg-slate-100 rounded-xl p-2 sm:p-6 overflow-hidden shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0 print:bg-white">
        <div
          ref={containerRef}
          className="rounded-lg overflow-hidden bg-white print:overflow-visible print:w-auto"
          style={{ width: "100%" }}
        >
          <div
            ref={innerRef}
            className="origin-top-left print:transform-none"
            style={{
              transform: `scale(var(--preview-scale, 1))`,
              width: `${INVOICE_WIDTH}px`,
              marginBottom: `calc((var(--preview-scale, 1) - 1) * ${INVOICE_WIDTH}px * 1.414)`,
            }}
          >
            <div ref={invoiceRef}>
              <RenderInvoice
                templateId={templateId}
                invoice={invoiceWithLogo}
                colorPalette={colorPalette}
                containerWidth={INVOICE_WIDTH}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="mt-6 bg-white rounded-lg shadow-sm shadow-gray-100 border border-slate-200 overflow-hidden print:hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">
            Payment History
          </h3>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-slate-500">Total: </span>
              <span className="font-semibold text-slate-900 tabular-nums">
                ₦{addThousandsSeparator(invoice.total)}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Paid: </span>
              <span className="font-semibold text-emerald-700 tabular-nums">
                ₦{addThousandsSeparator(amountPaid)}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Balance: </span>
              <span className="font-semibold text-slate-900 tabular-nums">
                ₦{addThousandsSeparator(balanceDue)}
              </span>
            </div>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">
            No payments logged yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {payments.map((payment: Payment) => (
              <div
                key={payment._id}
                className="p-4 sm:px-6 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 tabular-nums">
                    ₦{addThousandsSeparator(payment.amount)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {format(new Date(payment.date), "MMM d, yyyy")}
                    {payment.method ? ` • ${payment.method}` : ""}
                  </p>
                  {payment.note && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {payment.note}
                    </p>
                  )}
                </div>
                <Button
                  size="small"
                  variant="ghost"
                  aria-label="Delete payment"
                  onClick={() =>
                    setDeletePaymentModal({
                      open: true,
                      paymentId: payment._id,
                    })
                  }
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Payment Confirmation */}
      {deletePaymentModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Remove Payment
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to remove this payment record? The
                invoice's status and balance will be recalculated.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setDeletePaymentModal({ open: false, paymentId: null })
                  }
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeletePayment}
                  disabled={isDeletingPayment}
                >
                  {isDeletingPayment ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Removing...
                    </span>
                  ) : (
                    "Remove Payment"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoiceDetail;
