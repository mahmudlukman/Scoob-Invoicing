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
} from "lucide-react";
import { format } from "date-fns";
import Button from "../../components/ui/Button";
import {
  useGetAllInvoicesQuery,
  useDeleteInvoiceMutation,
  useUpdateInvoiceMutation,
} from "../../redux/features/invoice/invoiceApi";
import type { Invoice, ServerError } from "../../@types";
import ReminderModel from "../../components/invoices/ReminderModel";
import CreateWithAIModel from "../../components/invoices/CreateWithAIModel";
import { addThousandsSeparator } from "../../utils/helper";
import toast from "react-hot-toast";

const AllInvoices = () => {
  const navigate = useNavigate();

  const { data: invoicesData, isLoading, isError } = useGetAllInvoicesQuery();
  const [deleteInvoice] = useDeleteInvoiceMutation();
  const [updateInvoice] = useUpdateInvoiceMutation();

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

  const invoices = useMemo(() => {
    return invoicesData?.invoices || [];
  }, [invoicesData]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(id).unwrap();
      } catch (err: unknown) {
        const serverError = err as ServerError;
        const errorMessage =
          serverError.data?.message ||
          serverError.message ||
          "Failed to delete invoice";
        toast.error(errorMessage);
      }
    }
  };

  const handleStatusChange = async (invoice: Invoice) => {
    setStatusChangeLoading(invoice._id);
    try {
      const newStatus = invoice.status === "Paid" ? "Unpaid" : "Paid";
      const updatedInvoice = { ...invoice, status: newStatus };

      await updateInvoice({ id: invoice._id, data: updatedInvoice }).unwrap();
    } catch (err: unknown) {
      const serverError = err as ServerError;
      const errorMessage =
        serverError.data?.message ||
        serverError.message ||
        "Failed to update invoice status";
      toast.error(errorMessage);
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
          <div className="w-[90vw] md:w-auto overflow-x-auto">
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
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === "Paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : invoice.status === "Pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {invoice.status}
                      </span>
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
                        <Button
                          size="small"
                          variant="ghost"
                          onClick={() => navigate(`/invoices/${invoice._id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="small"
                          variant="ghost"
                          onClick={() => handleDelete(invoice._id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                        {invoice.status !== "Paid" && (
                          <Button
                            size="small"
                            variant="ghost"
                            onClick={() => handleOpenReminderModel(invoice._id)}
                            title="Generate Reminder"
                          >
                            <Mail className="w-4 h-4 text-blue-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllInvoices;
