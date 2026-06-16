import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import TextareaField from "../../components/ui/TextareaField";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useCreateInvoiceMutation,
  useGetAllInvoicesQuery,
} from "../../redux/features/invoice/invoiceApi";
import { useSelector } from "react-redux";
import type { InvoiceFormData, RootState, ServerError } from "../../@types";
import SelectField from "../../components/ui/SelectedField"; // Verify if filename matches your directory
import { addThousandsSeparator } from "../../utils/helper";

interface CreateInvoiceProps {
  existingInvoice?: InvoiceFormData;
  onSave?: (formData: InvoiceFormData) => Promise<void>;
}

const CreateInvoice = ({ existingInvoice, onSave }: CreateInvoiceProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: invoicesData } = useGetAllInvoicesQuery();
  const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();

  // Initialize form data with fallback values to ensure controlled inputs
  const initialFormData = useMemo(() => {
    const aiData = location.state?.aiData;

    if (existingInvoice) {
      return {
        ...existingInvoice,
        invoiceDate: existingInvoice.invoiceDate
          ? format(new Date(existingInvoice.invoiceDate), "yyyy-MM-dd")
          : new Date().toISOString().split("T")[0],
        dueDate: existingInvoice.dueDate
          ? format(new Date(existingInvoice.dueDate), "yyyy-MM-dd")
          : "",
      };
    }

    const baseData: InvoiceFormData = {
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      billFrom: {
        businessName: user?.businessName || "",
        email: user?.email || "",
        address: user?.address || "",
        phone: user?.phone || "",
      },
      billTo: { clientName: "", email: "", address: "", phone: "" },
      items: [{ name: "", quantity: 1, unitPrice: 0, taxPercent: 0 }],
      notes: "",
      paymentTerms: "Net 15",
    };

    if (aiData) {
      baseData.billTo = {
        clientName: aiData.clientName || "",
        email: aiData.email || "",
        address: aiData.address || "",
        phone: aiData.phone || "",
      };
      baseData.items =
        aiData.items?.map(
          (item: Partial<InvoiceFormData["items"][number]>) => ({
            name: item.name || "",
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice ?? 0,
            taxPercent: item.taxPercent ?? 0,
          }),
        ) || baseData.items;
    }

    return baseData;
  }, [existingInvoice, location.state, user]);

  const [formData, setFormData] = useState<InvoiceFormData>(initialFormData);
  const [isGeneratingNumber, setIsGeneratingNumber] =
    useState(!existingInvoice);

  // Auto-fill form data if initialFormData changes asynchronously (e.g., when user profile loads)
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  // Generate sequence invoice numbers based on existing records
  useEffect(() => {
    if (!existingInvoice && !formData.invoiceNumber) {
      setIsGeneratingNumber(true);
      try {
        const invoices = invoicesData?.invoices || [];
        let maxNum = 0;
        invoices.forEach((inv) => {
          // Robust parsing to catch variations in naming or missing fields
          if (inv.invoiceNumber && inv.invoiceNumber.includes("-")) {
            const num = parseInt(inv.invoiceNumber.split("-")[1], 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        });
        const newInvoiceNumber = `INV-${String(maxNum + 1).padStart(3, "0")}`;
        setFormData((prev) => ({ ...prev, invoiceNumber: newInvoiceNumber }));
      } catch (error) {
        console.error("Failed to generate invoice number", error);
        setFormData((prev) => ({
          ...prev,
          invoiceNumber: `INV-${Date.now().toString().slice(-5)}`,
        }));
      } finally {
        setIsGeneratingNumber(false);
      }
    }
  }, [existingInvoice, invoicesData, formData.invoiceNumber]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    section?: "billFrom" | "billTo",
    index?: number,
  ) => {
    const { name, value } = e.target;

    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [name]: value },
      }));
    } else if (index !== undefined) {
      const newItems = [...formData.items];

      // Allow empty inputs temporarily so users can backspace and type values smoothly
      let updatedValue: string | number = value;
      if (name !== "name") {
        updatedValue = value === "" ? "" : parseFloat(value);
      }

      newItems[index] = {
        ...newItems[index],
        [name]: updatedValue,
      };
      setFormData((prev) => ({ ...prev, items: newItems }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { name: "", quantity: 1, unitPrice: 0, taxPercent: 0 },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    // Keep at least one item row active
    if (formData.items.length === 1) {
      toast.error("An invoice must contain at least one item.");
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  // Perform accurate calculations, ensuring fallbacks handle empty string states during typing
  const { subtotal, taxTotal, total } = useMemo(() => {
    let subtotal = 0,
      taxTotal = 0;
    formData.items.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const tax = Number(item.taxPercent) || 0;

      const itemTotal = qty * price;
      subtotal += itemTotal;
      taxTotal += itemTotal * (tax / 100);
    });
    return { subtotal, taxTotal, total: subtotal + taxTotal };
  }, [formData.items]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Final clean up and typing compliance check before server submission
    const itemsWithTotal = formData.items.map((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const tax = Number(item.taxPercent) || 0;
      return {
        ...item,
        quantity: qty,
        unitPrice: price,
        taxPercent: tax,
        total: qty * price * (1 + tax / 100),
      };
    });

    const finalFormData: InvoiceFormData = {
      ...formData,
      items: itemsWithTotal,
      subtotal,
      taxTotal,
      total,
    };

    if (onSave) {
      await onSave(finalFormData);
    } else {
      try {
        await createInvoice(finalFormData).unwrap();
        toast.success("Invoice created successfully!");
        navigate("/invoices");
      } catch (err: unknown) {
        const serverError = err as ServerError;
        const errorMessage =
          serverError.data?.message ||
          serverError.message ||
          "Failed to create invoice";
        toast.error(errorMessage);
      }
    }
  };

  // Helper utility to safely manage view layer numbers and fallback strings smoothly
  const formatCurrencyValue = (val: number) => {
    const integerPart = Math.trunc(val);
    const formattedInteger = addThousandsSeparator(integerPart);
    const decimalPart = val.toFixed(2).split(".")[1];
    return `${formattedInteger}.${decimalPart}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-[10vh]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {existingInvoice ? "Edit Invoice" : "Create Invoice"}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Create and manage your invoices.
          </p>
        </div>
        <Button type="submit" isLoading={isCreating || isGeneratingNumber}>
          {existingInvoice ? "Save Changes" : "Save Invoice"}
        </Button>
      </div>

      {/* Meta details section */}
      <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField
            label="Invoice Number"
            name="invoiceNumber"
            readOnly
            value={formData.invoiceNumber}
            placeholder={isGeneratingNumber ? "Generating..." : ""}
            disabled
          />
          <InputField
            label="Invoice Date"
            name="invoiceDate"
            type="date"
            required
            value={formData.invoiceDate}
            onChange={handleInputChange}
          />
          <InputField
            label="Due Date"
            name="dueDate"
            type="date"
            required
            value={formData.dueDate}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Bill To / From Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Bill From
          </h3>
          <InputField
            label="Business Name"
            name="businessName"
            required
            value={formData.billFrom.businessName || ""}
            onChange={(e) => handleInputChange(e, "billFrom")}
          />
          <InputField
            label="Email"
            type="email"
            name="email"
            required
            value={formData.billFrom.email}
            onChange={(e) => handleInputChange(e, "billFrom")}
          />
          <TextareaField
            label="Address"
            name="address"
            required
            value={formData.billFrom.address}
            onChange={(e) => handleInputChange(e, "billFrom")}
          />
          <InputField
            label="Phone"
            name="phone"
            value={formData.billFrom.phone}
            onChange={(e) => handleInputChange(e, "billFrom")}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Bill To</h3>
          <InputField
            label="Client Name"
            name="clientName"
            required
            value={formData.billTo.clientName || ""}
            onChange={(e) => handleInputChange(e, "billTo")}
          />
          <InputField
            label="Client Email"
            type="email"
            name="email"
            required
            value={formData.billTo.email}
            onChange={(e) => handleInputChange(e, "billTo")}
          />
          <TextareaField
            label="Client Address"
            name="address"
            required
            value={formData.billTo.address}
            onChange={(e) => handleInputChange(e, "billTo")}
          />
          <InputField
            label="Client Phone"
            name="phone"
            value={formData.billTo.phone}
            onChange={(e) => handleInputChange(e, "billTo")}
          />
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white rounded-lg shadow-sm shadow-gray-100 border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">
                  Qty
                </th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-36">
                  Price
                </th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">
                  Tax (%)
                </th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-2 sm:px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {formData.items.map((item, index) => {
                const qty = Number(item.quantity) || 0;
                const price = Number(item.unitPrice) || 0;
                const tax = Number(item.taxPercent) || 0;
                const calculatedItemTotal = qty * price * (1 + tax / 100);

                return (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-2 sm:px-6 py-4">
                      <input
                        type="text"
                        name="name"
                        required
                        value={item.name}
                        onChange={(e) => handleInputChange(e, undefined, index)}
                        placeholder="Item name"
                        className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-2 sm:px-6 py-4">
                      <input
                        type="number"
                        name="quantity"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleInputChange(e, undefined, index)}
                        placeholder="1"
                        className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-2 sm:px-6 py-4">
                      <input
                        type="number"
                        name="unitPrice"
                        required
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleInputChange(e, undefined, index)}
                        placeholder="0.00"
                        step="0.01"
                        className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-2 sm:px-6 py-4">
                      <input
                        type="number"
                        name="taxPercent"
                        value={item.taxPercent}
                        onChange={(e) => handleInputChange(e, undefined, index)}
                        placeholder="0"
                        step="0.01"
                        className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-2 sm:px-6 py-4 text-sm text-slate-700 font-medium">
                      ₦{formatCurrencyValue(calculatedItemTotal)}
                    </td>
                    <td className="px-2 sm:px-6 py-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="small"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 sm:p-6 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddItem}
            icon={Plus}
          >
            Add Item
          </Button>
        </div>
      </div>

      {/* Summary Footer Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Notes & Terms
          </h3>
          <TextareaField
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
          />
          <SelectField
            label="Payment Terms"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleInputChange}
            options={["Net 15", "Net 30", "Net 60", "Due on receipt"]}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200 flex flex-col justify-center">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-slate-600">
              <p>Subtotal:</p>
              <p>₦{formatCurrencyValue(subtotal)}</p>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <p>Tax:</p>
              <p>₦{formatCurrencyValue(taxTotal)}</p>
            </div>
            <div className="flex justify-between text-sm font-semibold text-slate-900 border-t border-slate-200 pt-4 mt-4">
              <p>Total:</p>
              <p>₦{formatCurrencyValue(total)}</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateInvoice;
