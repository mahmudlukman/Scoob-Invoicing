import { AlertCircle, Edit, Mail, Paintbrush, Printer } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import CreateInvoice from "./CreateInvoice";
import ReminderModel from "../../components/invoices/ReminderModel";
import {
  useGetInvoiceQuery,
  useUpdateInvoiceMutation,
} from "../../redux/features/invoice/invoiceApi";
import type { InvoiceFormData, RootState, ServerError } from "../../@types";
import Loading from "../../components/ui/Loading";
import { useReactToPrint } from "react-to-print";
import RenderInvoice from "../../components/invoice-templates/RenderInvoice";

const DEFAULT_PALETTE = {
  primary: "#16A34A",
  secondary: "#15803D",
  background: "#F0FDF4",
};

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const { user } = useSelector((state: RootState) => state.auth);

  const templateId = user?.invoicePreferences?.templateId ?? "01";
  const colorPalette =
    user?.invoicePreferences?.colorPalette ?? DEFAULT_PALETTE;

  const { data: invoiceResponse, isLoading, isError } = useGetInvoiceQuery(id);
  const [updateInvoice] = useUpdateInvoiceMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  const invoice = invoiceResponse?.invoice || invoiceResponse;

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

  return (
    <>
      <ReminderModel
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        invoiceId={id!}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 print:hidden">
        <h1 className="text-2xl font-semibold text-slate-900 mb-4 sm:mb-0">
          Invoice{" "}
          <span className="font-mono text-slate-500">
            {invoice.invoiceNumber}
          </span>
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
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

      <div className="rounded-lg overflow-hidden shadow-md border border-slate-200 print:shadow-none print:border-none">
        <div ref={invoiceRef}>
          <RenderInvoice
            templateId={templateId}
            invoice={invoiceWithLogo}
            colorPalette={colorPalette}
            containerWidth={0}
          />
        </div>
      </div>
    </>
  );
};

export default InvoiceDetail;
