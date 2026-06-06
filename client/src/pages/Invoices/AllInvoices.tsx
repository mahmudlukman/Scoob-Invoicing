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

const StatusBadge = ({ status }: { status: Invoice["status"] }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      status === "Paid"
        ? "bg-emerald-100 text-emerald-800"
        : status === "Pending"
          ? "bg-amber-100 text-amber-800"
          : "bg-red-100 text-red-800"
    }`}
  >
    {status}
  </span>
);

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

  const invoices = useMemo(() => invoicesData?.invoices || [], [invoicesData]);

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    invoiceId: string | null;
  }>({ open: false, invoiceId: null });

  const handleDelete = async () => {
    if (!deleteModal.invoiceId) return;
    try {
      await deleteInvoice(deleteModal.invoiceId).unwrap();
      toast.success("Invoice deleted successfully");
      setDeleteModal({ open: false, invoiceId: null });
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError.data?.message ||
          serverError.message ||
          "Failed to delete invoice",
      );
    }
  };

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

  const handleStatusChange = async (invoice: Invoice) => {
    setStatusChangeLoading(invoice._id);
    try {
      const newStatus = invoice.status === "Paid" ? "Unpaid" : "Paid";
      await updateInvoice({
        id: invoice._id,
        data: { status: newStatus },
      }).unwrap();
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError.data?.message ||
          serverError.message ||
          "Failed to update invoice status",
      );
    } finally {
      setStatusChangeLoading(null);
    }
  };

  const handleOpenReminderModel = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsReminderModalOpen(true);
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
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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

      {/* Header */}
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

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        {/* Filters */}
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by invoice # or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-shrink-0">
              <select
                className="w-full sm:w-auto h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>

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
            {/* ── Mobile card list (hidden on md+) ── */}
            <ul className="md:hidden p-4 space-y-4">
              {filteredInvoices.map((invoice) => (
                <li
                  key={invoice._id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Clickable content */}
                  <div
                    onClick={() => navigate(`/invoice/${invoice._id}`)}
                    className="p-4 cursor-pointer active:bg-slate-50"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {invoice.billTo.clientName}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          #{invoice.invoiceNumber}
                        </p>
                      </div>

                      <StatusBadge status={invoice.status} />
                    </div>

                    {/* Amount */}
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Amount
                      </p>

                      <p className="text-xl font-bold text-slate-900 mt-1">
                        ₦{addThousandsSeparator(invoice.total)}
                      </p>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div>
                        <p className="text-xs text-slate-400">Due Date</p>

                        <p className="font-medium text-slate-700">
                          {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-400">Created</p>

                        <p className="font-medium text-slate-700">
                          {format(new Date(invoice.invoiceDate), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="border-t border-slate-100 bg-slate-50 px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => handleStatusChange(invoice)}
                        isLoading={statusChangeLoading === invoice._id}
                      >
                        {invoice.status === "Paid"
                          ? "Mark Unpaid"
                          : "Mark Paid"}
                      </Button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/invoice/${invoice._id}`)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDuplicate(invoice)}
                          disabled={duplicateLoading === invoice._id}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-violet-500 hover:bg-violet-100 transition-colors"
                        >
                          {duplicateLoading === invoice._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {invoice.status !== "Paid" && (
                          <button
                            onClick={() => handleOpenReminderModel(invoice._id)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() =>
                            setDeleteModal({
                              open: true,
                              invoiceId: invoice._id,
                            })
                          }
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* ── Desktop table (hidden below md) ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-slate-50">
                      <td
                        onClick={() => navigate(`/invoice/${invoice._id}`)}
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 cursor-pointer"
                      >
                        {invoice.invoiceNumber}
                      </td>
                      <td
                        onClick={() => navigate(`/invoice/${invoice._id}`)}
                        className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 cursor-pointer"
                      >
                        {invoice.billTo.clientName}
                      </td>
                      <td
                        onClick={() => navigate(`/invoice/${invoice._id}`)}
                        className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 cursor-pointer"
                      >
                        ₦{addThousandsSeparator(invoice.total)}
                      </td>
                      <td
                        onClick={() => navigate(`/invoice/${invoice._id}`)}
                        className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 cursor-pointer"
                      >
                        {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => handleStatusChange(invoice)}
                            isLoading={statusChangeLoading === invoice._id}
                          >
                            {invoice.status === "Paid"
                              ? "Mark Unpaid"
                              : "Mark Paid"}
                          </Button>
                          <Tooltip text="Edit Invoice" position="top">
                            <Button
                              size="small"
                              variant="ghost"
                              onClick={() =>
                                navigate(`/invoice/${invoice._id}`)
                              }
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip text="Duplicate Invoice" position="top">
                            <Button
                              size="small"
                              variant="ghost"
                              onClick={() => handleDuplicate(invoice)}
                              isLoading={duplicateLoading === invoice._id}
                            >
                              <Copy className="w-4 h-4 text-violet-500" />
                            </Button>
                          </Tooltip>
                          <Tooltip text="Delete Invoice" position="left">
                            <Button
                              size="small"
                              variant="ghost"
                              onClick={() =>
                                setDeleteModal({
                                  open: true,
                                  invoiceId: invoice._id,
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </Tooltip>
                          {invoice.status !== "Paid" && (
                            <Tooltip text="Generate Reminder" position="left">
                              <Button
                                size="small"
                                variant="ghost"
                                onClick={() =>
                                  handleOpenReminderModel(invoice._id)
                                }
                              >
                                <Mail className="w-4 h-4 text-blue-500" />
                              </Button>
                            </Tooltip>
                          )}
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

      {/* Delete confirmation modal */}
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
                    setDeleteModal({ open: false, invoiceId: null })
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
