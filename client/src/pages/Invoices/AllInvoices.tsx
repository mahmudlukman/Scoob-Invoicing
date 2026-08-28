import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  FileText,
  Loader2,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

import Button from "../../components/ui/Button";

import {
  useGetAllInvoicesQuery,
  useDeleteInvoiceMutation,
  useDuplicateInvoiceMutation,
  useAddPaymentMutation,
} from "../../redux/features/invoice/invoiceApi";

import type { Invoice, ServerError } from "../../@types";

import ReminderModel from "../../components/invoices/ReminderModel";
import CreateWithAIModel from "../../components/invoices/CreateWithAIModel";
import LogPaymentModal from "../../components/invoices/LogPaymentModal";
import PaymentActionDropdown from "../../components/invoices/PaymentActionDropdown";
import SendReceiptDropdown from "../../components/invoices/SendReceiptDropdown";
import InvoiceActionsDropdown from "../../components/invoices/InvoiceActionsDropdown";

import { addThousandsSeparator } from "../../utils/helper";
import toast from "react-hot-toast";

/* -------------------------------------------------------------------------- */
/*                               Helper Components                            */
/* -------------------------------------------------------------------------- */

const getStatusDisplay = (invoice: Invoice) => {
  if (invoice.status === "Paid") {
    return {
      label: "Paid",
      className: "bg-emerald-100 text-emerald-800",
    };
  }

  if (invoice.isOverdue) {
    return {
      label: "Overdue",
      className: "bg-red-100 text-red-800",
    };
  }

  if (invoice.status === "Partially Paid") {
    return {
      label: "Partially Paid",
      className: "bg-blue-100 text-blue-800",
    };
  }

  if (invoice.status === "Pending") {
    return {
      label: "Pending",
      className: "bg-amber-100 text-amber-800",
    };
  }

  return {
    label: "Unpaid",
    className: "bg-red-100 text-red-800",
  };
};

const StatusBadge = ({ invoice }: { invoice: Invoice }) => {
  const { label, className } = getStatusDisplay(invoice);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
};

const AmountCell = ({ invoice }: { invoice: Invoice }) => {
  const currencySymbol = invoice.currency?.symbol || "₦";

  const paidPercent =
    invoice.total > 0
      ? Math.min(100, (invoice.amountPaid / invoice.total) * 100)
      : 0;

  return (
    <div>
      <p className="text-sm font-semibold text-slate-900 tabular-nums">
        {currencySymbol}
        {addThousandsSeparator(invoice.total)}
      </p>

      {invoice.status === "Partially Paid" && (
        <div className="mt-1.5 w-28">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${paidPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 mt-1 tabular-nums">
            {currencySymbol}
            {addThousandsSeparator(invoice.amountPaid)} of {currencySymbol}
            {addThousandsSeparator(invoice.total)}
          </p>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

const AllInvoices = () => {
  const navigate = useNavigate();

  /* ------------------------------------------------------------------------ */
  /*                               API Hooks                                  */
  /* ------------------------------------------------------------------------ */

  const { data: invoicesData, isLoading, isError } = useGetAllInvoicesQuery();

  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();

  const [duplicateInvoice] = useDuplicateInvoiceMutation();

  const [addPayment] = useAddPaymentMutation();

  /* ------------------------------------------------------------------------ */
  /*                              Local State                                 */
  /* ------------------------------------------------------------------------ */

  const [duplicateLoading, setDuplicateLoading] = useState<string | null>(null);

  const [fullPaymentLoadingId, setFullPaymentLoadingId] = useState<
    string | null
  >(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );

  const [logPaymentModal, setLogPaymentModal] = useState<{
    open: boolean;
    invoice: Invoice | null;
  }>({
    open: false,
    invoice: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    invoiceId: string | null;
  }>({
    open: false,
    invoiceId: null,
  });

  /* ------------------------------------------------------------------------ */
  /*                              Invoice Data                                */
  /* ------------------------------------------------------------------------ */

  const invoices = useMemo(() => {
    return invoicesData?.invoices || [];
  }, [invoicesData]);

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter(
        (invoice) => statusFilter === "All" || invoice.status === statusFilter,
      )
      .filter(
        (invoice) =>
          invoice.invoiceNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (invoice.billTo.clientName ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
      .sort(
        (a, b) =>
          new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime(),
      );
  }, [invoices, searchTerm, statusFilter]);

  /* ------------------------------------------------------------------------ */
  /*                              Delete Invoice                              */
  /* ------------------------------------------------------------------------ */

  const handleDelete = async () => {
    if (!deleteModal.invoiceId) return;

    try {
      await deleteInvoice(deleteModal.invoiceId).unwrap();

      toast.success("Invoice deleted successfully");

      setDeleteModal({
        open: false,
        invoiceId: null,
      });
    } catch (err: unknown) {
      const serverError = err as ServerError;

      toast.error(
        serverError.data?.message ||
          serverError.message ||
          "Failed to delete invoice",
      );
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                            Duplicate Invoice                             */
  /* ------------------------------------------------------------------------ */

  const handleDuplicate = async (invoice: Invoice) => {
    setDuplicateLoading(invoice._id);

    try {
      const result = await duplicateInvoice(invoice._id).unwrap();

      toast.success(`Invoice duplicated as ${result.invoice.invoiceNumber}`);

      navigate(`/invoice/${result.invoice._id}`);
    } catch (err: unknown) {
      const serverError = err as ServerError;

      toast.error(
        serverError.data?.message ||
          serverError.message ||
          "Failed to duplicate invoice",
      );
    } finally {
      setDuplicateLoading(null);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                           Reminder Modal                                 */
  /* ------------------------------------------------------------------------ */

  const handleOpenReminderModel = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsReminderModalOpen(true);
  };

  /* ------------------------------------------------------------------------ */
  /*                           Full Payment                                   */
  /* ------------------------------------------------------------------------ */

  const handleFullPayment = async (invoice: Invoice) => {
    setFullPaymentLoadingId(invoice._id);

    try {
      await addPayment({
        invoiceId: invoice._id,
        data: {
          amount: invoice.balanceDue,
          method: "Full Payment",
        },
      }).unwrap();

      toast.success("Invoice marked as fully paid");
    } catch (err: unknown) {
      const serverError = err as ServerError;

      toast.error(
        serverError.data?.message ||
          serverError.message ||
          "Failed to record payment",
      );
    } finally {
      setFullPaymentLoadingId(null);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                           Partial Payment                                */
  /* ------------------------------------------------------------------------ */

  const handleOpenPartialPayment = (invoice: Invoice) => {
    setLogPaymentModal({
      open: true,
      invoice,
    });
  };

  /* ------------------------------------------------------------------------ */
  /*                              Loading State                               */
  /* ------------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                               Error State                                */
  /* ------------------------------------------------------------------------ */

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Failed to load invoices
        </h3>

        <p className="text-slate-500 mb-6">
          There was an error loading your invoices. Please try again.
        </p>

        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                                Render                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Modals                                                              */}
      {/* ------------------------------------------------------------------ */}

      <CreateWithAIModel
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      <ReminderModel
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        invoiceId={selectedInvoiceId}
      />

      <LogPaymentModal
        key={logPaymentModal.invoice?._id ?? "none"}
        isOpen={logPaymentModal.open}
        onClose={() =>
          setLogPaymentModal({
            open: false,
            invoice: null,
          })
        }
        invoiceId={logPaymentModal.invoice?._id ?? null}
        balanceDue={logPaymentModal.invoice?.balanceDue ?? 0}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Page Header                                                         */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            All Invoices
          </h1>

          <p className="text-sm text-slate-600 mt-1">
            Manage all your invoices in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsAiModalOpen(true)}
            icon={Sparkles}
          >
            Create with AI
          </Button>

          <Button onClick={() => navigate("/invoices/new")} icon={Plus}>
            Create Invoice
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Invoice Container                                                   */}
      {/* ------------------------------------------------------------------ */}

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        {/* ---------------------------------------------------------------- */}
        {/* Filters                                                           */}
        {/* ---------------------------------------------------------------- */}

        <div className="p-4 sm:p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>

              <input
                type="text"
                placeholder="Search by invoice # or client..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="
                  w-full h-10 pl-10 pr-4 py-2
                  border border-slate-200 rounded-lg
                  bg-white text-slate-900
                  placeholder-slate-400
                  focus:outline-none
                  focus:ring-2 focus:ring-blue-500
                "
              />
            </div>

            {/* Status Filter */}
            <div className="flex-shrink-0">
              <select
                className="
                  w-full sm:w-auto h-10 px-3 py-2
                  border border-slate-200 rounded-lg
                  bg-white text-sm text-slate-900
                  focus:outline-none
                  focus:ring-2 focus:ring-blue-500
                "
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Pending">Pending</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Empty State                                                       */}
        {/* ---------------------------------------------------------------- */}

        {filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>

            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No invoices found
            </h3>

            <p className="text-slate-500 mb-6 max-w-md">
              Your search or filter criteria did not match any invoices. Try
              adjusting your search.
            </p>

            {invoices.length === 0 && (
              <Button onClick={() => navigate("/invoices/new")} icon={Plus}>
                Create First Invoice
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* ============================================================ */}
            {/* Mobile Cards                                                  */}
            {/* ============================================================ */}

            <div className="md:hidden divide-y divide-slate-100 bg-slate-50/50">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="
                    p-4 bg-white space-y-3.5
                    transition-colors
                    active:bg-slate-50/80
                  "
                >
                  {/* Top Row */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/invoice/${invoice._id}`)}
                      className="
                        group flex items-center gap-1.5 text-left
                        focus:outline-none
                      "
                    >
                      <span
                        className="
                          text-base font-bold text-slate-900
                          group-hover:text-blue-600
                          transition-colors
                        "
                      >
                        {invoice.invoiceNumber}
                      </span>
                    </button>

                    <StatusBadge invoice={invoice} />
                  </div>

                  {/* Invoice Details */}
                  <div
                    className="grid grid-cols-2 gap-3 pt-0.5 cursor-pointer"
                    onClick={() => navigate(`/invoice/${invoice._id}`)}
                  >
                    {/* Client */}
                    <div className="col-span-2">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Client
                      </p>

                      <p className="text-sm font-semibold text-slate-700 truncate mt-0.5">
                        {invoice.billTo.clientName || "—"}
                      </p>
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Amount
                      </p>

                      <div className="mt-0.5">
                        <AmountCell invoice={invoice} />
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="text-right">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Due Date
                      </p>

                      <p className="text-sm font-semibold text-slate-700 tabular-nums mt-0.5">
                        {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div
                    className="
                      flex items-center justify-between gap-3
                      pt-3 border-t border-slate-100
                    "
                    onClick={(event) => event.stopPropagation()}
                  >
                    {/* Payment */}
                    <div className="flex-1 min-w-0">
                      {invoice.status === "Paid" ? (
                        <SendReceiptDropdown invoice={invoice} />
                      ) : (
                        <PaymentActionDropdown
                          invoice={invoice}
                          isProcessing={fullPaymentLoadingId === invoice._id}
                          onFullPayment={() => handleFullPayment(invoice)}
                          onPartialPayment={() =>
                            handleOpenPartialPayment(invoice)
                          }
                        />
                      )}
                    </div>

                    {/* More Actions */}
                    <InvoiceActionsDropdown
                      invoice={invoice}
                      isDuplicating={duplicateLoading === invoice._id}
                      onEdit={() => navigate(`/invoice/${invoice._id}`)}
                      onDuplicate={() => handleDuplicate(invoice)}
                      onReminder={() => handleOpenReminderModel(invoice._id)}
                      onDelete={() =>
                        setDeleteModal({
                          open: true,
                          invoiceId: invoice._id,
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ============================================================ */}
            {/* Desktop Table                                                 */}
            {/* ============================================================ */}

            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                {/* Table Header */}
                <thead className="bg-slate-50">
                  <tr>
                    <th
                      className="
                        px-6 py-3 text-left
                        text-xs font-medium text-slate-500
                        uppercase tracking-wider
                      "
                    >
                      Invoice #
                    </th>

                    <th
                      className="
                        px-6 py-3 text-left
                        text-xs font-medium text-slate-500
                        uppercase tracking-wider
                      "
                    >
                      Client
                    </th>

                    <th
                      className="
                        px-6 py-3 text-left
                        text-xs font-medium text-slate-500
                        uppercase tracking-wider
                      "
                    >
                      Amount
                    </th>

                    <th
                      className="
                        px-6 py-3 text-left
                        text-xs font-medium text-slate-500
                        uppercase tracking-wider
                      "
                    >
                      Due Date
                    </th>

                    <th
                      className="
                        px-6 py-3 text-left
                        text-xs font-medium text-slate-500
                        uppercase tracking-wider
                      "
                    >
                      Status
                    </th>

                    <th
                      className="
                        px-6 py-3 text-left
                        text-xs font-medium text-slate-500
                        uppercase tracking-wider
                      "
                    >
                      Payment
                    </th>

                    <th
                      className="
                        px-6 py-3 text-right
                        text-xs font-medium text-slate-500
                        uppercase tracking-wider
                      "
                    >
                      More
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-slate-50">
                      {/* Invoice Number */}
                      <td
                        onClick={() => navigate(`/invoice/${invoice._id}`)}
                        className="
                          px-6 py-4 whitespace-nowrap
                          text-sm font-medium text-slate-900
                          cursor-pointer
                        "
                      >
                        {invoice.invoiceNumber}
                      </td>

                      {/* Client */}
                      <td
                        onClick={() => navigate(`/invoice/${invoice._id}`)}
                        className="
                          px-6 py-4 whitespace-nowrap
                          text-sm text-slate-600
                          cursor-pointer
                        "
                      >
                        {invoice.billTo.clientName}
                      </td>

                      {/* Amount */}
                      <td
                        onClick={() => navigate(`/invoice/${invoice._id}`)}
                        className="
                          px-6 py-4 whitespace-nowrap
                          cursor-pointer
                        "
                      >
                        <AmountCell invoice={invoice} />
                      </td>

                      {/* Due Date */}
                      <td
                        onClick={() => navigate(`/invoice/${invoice._id}`)}
                        className="
                          px-6 py-4 whitespace-nowrap
                          text-sm text-slate-600
                          cursor-pointer tabular-nums
                        "
                      >
                        {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <StatusBadge invoice={invoice} />
                      </td>

                      {/* Payment */}
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {invoice.status === "Paid" ? (
                          <SendReceiptDropdown invoice={invoice} />
                        ) : (
                          <PaymentActionDropdown
                            invoice={invoice}
                            isProcessing={fullPaymentLoadingId === invoice._id}
                            onFullPayment={() => handleFullPayment(invoice)}
                            onPartialPayment={() =>
                              handleOpenPartialPayment(invoice)
                            }
                          />
                        )}
                      </td>

                      {/* More Actions */}
                      <td
                        className="
                          px-6 py-4 whitespace-nowrap
                          text-right
                        "
                        onClick={(event) => event.stopPropagation()}
                      >
                        <InvoiceActionsDropdown
                          invoice={invoice}
                          isDuplicating={duplicateLoading === invoice._id}
                          onEdit={() => navigate(`/invoice/${invoice._id}`)}
                          onDuplicate={() => handleDuplicate(invoice)}
                          onReminder={() =>
                            handleOpenReminderModel(invoice._id)
                          }
                          onDelete={() =>
                            setDeleteModal({
                              open: true,
                              invoiceId: invoice._id,
                            })
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Delete Confirmation Modal                                          */}
      {/* ------------------------------------------------------------------ */}

      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Delete Invoice
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to delete this invoice? This action cannot
                be undone.
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setDeleteModal({
                      open: false,
                      invoiceId: null,
                    })
                  }
                >
                  Cancel
                </Button>

                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    "Delete Invoice"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllInvoices;
