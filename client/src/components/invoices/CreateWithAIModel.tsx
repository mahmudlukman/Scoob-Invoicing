import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextareaField from "../ui/TextareaField";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { toast } from "react-hot-toast";
import { useParseInvoiceFromTextMutation } from "../../redux/features/ai/aiApi";

interface CreateWithAIModelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateWithAIModel = ({ isOpen, onClose }: CreateWithAIModelProps) => {
  const [text, setText] = useState("");
  const navigate = useNavigate();
  
  const [parseInvoice, { isLoading }] = useParseInvoiceFromTextMutation();

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Please paste some text to generate an invoice.");
      return;
    }

    try {
      const response = await parseInvoice({ text }).unwrap();
      toast.success("Invoice data extracted successfully!");
      onClose();
      setText(""); // Reset text after successful generation
      // Navigate to create invoice page with the parsed data
      navigate("/invoices/new", { state: { aiData: response } });
    } catch (error) {
      toast.error("Failed to generate invoice from text.");
      console.error("AI parsing error:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Invoice with AI"
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center mb-2">
          <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
          <p className="text-sm text-slate-600">
            Paste any text that contains invoice details (like client name,
            items, quantities, and prices) and the AI will attempt to create an
            invoice from it.
          </p>
        </div>

        <TextareaField
          name="invoiceText"
          label="Paste Invoice Text Here"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., 'Invoice for ClientCorp: 2 hours of design work at $150/hr and one logo for $800'"
          rows={8}
        />

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} isLoading={isLoading}>
            {isLoading ? "Generating..." : "Generate Invoice"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateWithAIModel;