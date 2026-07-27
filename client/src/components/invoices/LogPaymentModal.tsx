import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import InputField from "../ui/InputField";
import SelectField from "../ui/SelectedField";
import { useAddPaymentMutation } from "../../redux/features/invoice/invoiceApi";
import type { ServerError } from "../../@types";
import toast from "react-hot-toast";

interface LogPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string | null;
  balanceDue: number;
}

const LogPaymentModal = ({
  isOpen,
  onClose,
  invoiceId,
  balanceDue,
}: LogPaymentModalProps) => {
  const [addPayment, { isLoading }] = useAddPaymentMutation();

  const [amount, setAmount] = useState(balanceDue ? String(balanceDue) : "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("Bank Transfer");
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    if (!invoiceId) return;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }

    try {
      await addPayment({
        invoiceId,
        data: { amount: parsedAmount, date, method, note },
      }).unwrap();
      toast.success("Payment logged successfully");
      onClose();
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError.data?.message ||
          serverError.message ||
          "Failed to log payment",
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Payment">
      <div className="p-6 space-y-4 w-full max-w-md">
        <p className="text-sm text-slate-500">
          Balance due: ₦{balanceDue.toLocaleString()}
        </p>

        <InputField
          label="Amount"
          type="number"
          name="amount"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <InputField
          label="Payment Date"
          type="date"
          name="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <SelectField
          label="Method"
          name="method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          options={["Bank Transfer", "Cash", "Card", "Other"]}
        />
        <InputField
          label="Note (optional)"
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Log Payment
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LogPaymentModal;
