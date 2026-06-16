import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Edit,
  FileText,
  Loader2,
  Mail,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import Button from "../../components/ui/Button";
import {
  useGetAllInvoicesQuery,
  useDeleteInvoiceMutation,
  useUpdateInvoiceMutation,
  useDuplicateInvoiceMutation,
} from "../../redux/features/invoice/invoiceApi";
import type { Invoice, ServerError } from "../../@types";
import ReminderModel from "../../components/invoices/ReminderModel";
import CreateWithAIModel from "../../components/invoices/CreateWithAIModel";
import { addThousandsSeparator } from "../../utils/helper";
import toast from "react-hot-toast";
import Tooltip from "../../components/ui/Tooltip";

const StatusBadge = ({ status }: { status: Invoice["status"] }) => {
  const styles = {
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-100/80 icon-emerald-500",
    Pending: "bg-amber-50 text-amber-700 border-amber-100/80 icon-amber-500",
    Unpaid: "bg-rose-50 text-rose-700 border-rose-100/80 icon-rose-500",
  } as const;

  const Icons = {
    Paid: CheckCircle2,
    Pending: Clock,
    Unpaid: XCircle,
  } as const;

  const statusKey = status as keyof typeof Icons;
  const IconComponent = Icons[statusKey] || Clock;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${styles[statusKey]}`}
    >
      <IconComponent className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

const AllInvoices = () => {
  const navigate = useNavigate();

  const { data: invoicesData, isLoading, isError } = useGetAllInvoicesQuery();
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();
  const [updateInvoice] = useUpdateInvoiceMutation();
  const [duplicateInvoice] = useDuplicateInvoiceMutation();

  const [duplicateLoading, setDuplicateLoading] = useState<string | null>(null);
  const [statusChangeLoading, setStatusChangeLoading] = useState<string | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    invoiceId: string | null;
  }>({ open: false, invoiceId: null });

  const invoices = useMemo(() => invoicesData?.invoices || [], [invoicesData]);

  const handleDelete = async () => {
    if (!deleteModal.invoiceId) return;
    try {
      await deleteInvoice(deleteModal.invoiceId).unwrap();
      toast.success("Invoice successfully purged from ledger");
      setDeleteModal({ open: false, invoiceId: null });
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError.data?.message ||
          serverError.message ||
          "Failed to complete deletion process",
      );
    }
  };

  const handleDuplicate = async (invoice: Invoice) => {
    setDuplicateLoading(invoice._id);
    try {
      const result = await duplicateInvoice(invoice._id).unwrap();
      toast.success(`Cloned asset created: ${result.invoice.invoiceNumber}`);
      navigate(`/invoice/${result.invoice._id}`);
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError.data?.message ||
          serverError.message ||
          "Failed to clone record profiles",
      );
    } finally {
      setDuplicateLoading(null);
      setActiveMenuId(null);
    }
  };

  const handleStatusChange = async (invoice: Invoice) => {
    setStatusChangeLoading(invoice._id);
    try {
      const newStatus = invoice.status === "Paid" ? "Unpaid" : "Paid";
      await updateInvoice({
        id: invoice._id,
        data: { status: newStatus },
      }).unwrap();
      toast.success(`Ledger state balanced to ${newStatus}`);
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError.data?.message ||
          serverError.message ||
          "Status synchronization failed",
      );
    } finally {
      setStatusChangeLoading(null);
    }
  };

  const handleOpenReminderModel = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsReminderModalOpen(true);
    setActiveMenuId(null);
  };

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

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[28rem] bg-white border border-slate-100 rounded-2xl shadow-sm">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 stroke-[2.5]" />
        <p className="text-xs font-semibold text-slate-400 mt-4 tracking-wide uppercase">
          Assembling Ledger Directories...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[28rem] text-center bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mb-4 text-rose-600 shadow-sm">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Directory Connection Fault
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed font-medium">
          An issue occurred while querying the server database for modern client
          files. Verify platform routing status parameters.
        </p>
        <div className="mt-6">
          <Button
            variant="secondary"
            className="shadow-sm border-slate-200"
            onClick={() => window.location.reload()}
          >
            Re-Initialize Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreateWithAIModel
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
      <ReminderModel
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        invoiceId={selectedInvoiceId}
      />

      {/* Primary Top Action Deck */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
            Financial Invoices
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Audit, pipeline, and dispatch multi-currency corporate receivables.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Button
            variant="secondary"
            onClick={() => setIsAiModalOpen(true)}
            icon={Sparkles}
            className="flex-1 md:flex-none border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
          >
            Create with AI
          </Button>
          <Button
            onClick={() => navigate("/invoices/new")}
            icon={Plus}
            className="flex-1 md:flex-none shadow-sm shadow-blue-500/10"
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Main Core Dataset Table Frame */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.015)] overflow-hidden">
        {/* Dynamic Filters Interface */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by index ref, client identity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex-shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto h-10 px-3.5 border border-slate-200 rounded-xl bg-white text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="All">All Transactions</option>
                <option value="Paid">Cleared (Paid)</option>
                <option value="Pending">Awaiting (Pending)</option>
                <option value="Unpaid">Defaulted (Unpaid)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic State Layout Output Engine */}
        {filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-3 text-slate-400">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              No Registry Records Found
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed font-medium">
              We couldn't locate data matching your exact filter queries.
              Restructure search elements.
            </p>
            {invoices.length === 0 && (
              <Button
                onClick={() => navigate("/invoices/new")}
                icon={Plus}
                size="small"
                className="mt-4"
              >
                Initialize First Invoice
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* ── Mobile Container Matrix Layout (Hidden on Screens ≥ md) ── */}
            <div className="md:hidden p-4 space-y-3 bg-slate-50/40">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:border-slate-300 transition-colors"
                >
                  <div
                    className="p-4"
                    onClick={() => navigate(`/invoice/${invoice._id}`)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-0.5">
                          #{invoice.invoiceNumber}
                        </p>
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {invoice.billTo.clientName}
                        </h4>
                      </div>
                      <StatusBadge status={invoice.status} />
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Outstanding balance
                        </p>
                        <p className="text-base font-extrabold text-slate-900 mt-0.5">
                          ₦{addThousandsSeparator(invoice.total)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Due limit
                        </p>
                        <p className="text-xs font-semibold text-slate-600 mt-1">
                          {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Context Micro-Actions Block */}
                  <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 flex items-center justify-between">
                    <Button
                      size="small"
                      variant="secondary"
                      className="bg-white border-slate-200 text-xs font-bold py-1 px-3 h-8"
                      onClick={() => handleStatusChange(invoice)}
                      isLoading={statusChangeLoading === invoice._id}
                    >
                      {invoice.status === "Paid"
                        ? "Flag Unpaid"
                        : "Verify Payment"}
                    </Button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => navigate(`/invoice/${invoice._id}`)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200/70 transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(invoice)}
                        disabled={duplicateLoading === invoice._id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-violet-500 hover:bg-violet-50 transition-all"
                      >
                        {duplicateLoading === invoice._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({ open: true, invoiceId: invoice._id })
                        }
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop Tabular Sheet Framework (Hidden on Mobile) ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    <th className="px-6 py-3.5">Invoice Number</th>
                    <th className="px-6 py-3.5">Client Name</th>
                    <th className="px-6 py-3.5">Gross Total</th>
                    <th className="px-6 py-3.5">Due Date</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-600">
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="hover:bg-slate-50/70 group transition-colors"
                    >
                      <td
                        onClick={() => navigate(`/invoice/${invoice._id}`)}
                        className="px-6 py-4 text-slate-900 cursor-pointer tabular-nums"
                      >
                        #{invoice.invoiceNumber}
                      </td>
                      <td
                        onClick={() => navigate(`/invoice/${invoice._id}`)}
                        className="px-6 py-4 text-slate-900 cursor-pointer max-w-[160px] truncate"
                      >
                        {invoice.billTo.clientName}
                      </td>
                      <td
                        onClick={() => navigate(`/invoice/${invoice._id}`)}
                        className="px-6 py-4 text-slate-900 cursor-pointer tabular-nums"
                      >
                        ₦{addThousandsSeparator(invoice.total)}
                      </td>
                      <td
                        onClick={() => navigate(`/invoice/${invoice._id}`)}
                        className="px-6 py-4 text-slate-500 font-medium cursor-pointer tabular-nums"
                      >
                        {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="small"
                            variant="secondary"
                            className="bg-white border-slate-200 text-[11px] font-bold py-1 px-2.5 h-8 opacity-90 group-hover:opacity-100"
                            onClick={() => handleStatusChange(invoice)}
                            isLoading={statusChangeLoading === invoice._id}
                          >
                            {invoice.status === "Paid"
                              ? "Mark Unpaid"
                              : "Mark Paid"}
                          </Button>

                          <div className="relative inline-flex items-center bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/40">
                            <Tooltip text="Edit">
                              <button
                                onClick={() =>
                                  navigate(`/invoice/${invoice._id}`)
                                }
                                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white transition-all"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </Tooltip>

                            <Tooltip text="Duplicate">
                              <button
                                onClick={() => handleDuplicate(invoice)}
                                disabled={duplicateLoading === invoice._id}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-violet-500 hover:bg-white transition-all"
                              >
                                {duplicateLoading === invoice._id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </Tooltip>

                            {invoice.status !== "Paid" && (
                              <Tooltip text="Send Payment Reminder">
                                <button
                                  onClick={() =>
                                    handleOpenReminderModel(invoice._id)
                                  }
                                  className="w-7 h-7 rounded-md flex items-center justify-center text-blue-500 hover:bg-white transition-all"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </button>
                              </Tooltip>
                            )}

                            <Tooltip text="Delete">
                              <button
                                onClick={() =>
                                  setDeleteModal({
                                    open: true,
                                    invoiceId: invoice._id,
                                  })
                                }
                                className="w-7 h-7 rounded-md flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-white transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal Container */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 transition-all">
            <div className="p-5 text-center">
              <div className="w-11 h-11 bg-rose-50 border border-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3.5">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Purge Invoice File?
              </h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
                Are you completely confident you want to wipe this ledger
                statement? Historical indexing parameters will be permanently
                broken.
              </p>
            </div>
            <div className="px-5 pb-5 pt-2 flex items-center gap-2">
              <Button
                variant="secondary"
                className="flex-1 border-slate-200 bg-white"
                onClick={() => setDeleteModal({ open: false, invoiceId: null })}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1 shadow-sm shadow-rose-500/10"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Confirm Purge"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllInvoices;
