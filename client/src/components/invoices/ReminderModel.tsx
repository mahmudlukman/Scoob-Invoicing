import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check, Copy, Loader2, Mail, Send } from "lucide-react";
import TextareaField from "../ui/TextareaField";
import InputField from "../ui/InputField"; // Add this import
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { 
  useGenerateReminderEmailMutation,
  useSendReminderEmailMutation 
} from "../../redux/features/ai/aiApi";

interface ReminderModelProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string | null;
}

const ReminderModel = ({ isOpen, onClose, invoiceId }: ReminderModelProps) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [hasCopied, setHasCopied] = useState(false);

  const [generateReminder, { isLoading: isGenerating }] = useGenerateReminderEmailMutation();
  const [sendReminder, { isLoading: isSending }] = useSendReminderEmailMutation();

  useEffect(() => {
    if (isOpen && invoiceId) {
      const fetchReminder = async () => {
        setSubject("");
        setBody("");
        setHasCopied(false);

        try {
          const response = await generateReminder({ invoiceId }).unwrap();
          console.log("AI Reminder Response:", response);
          
          // Assuming the API returns both subject and body
          setSubject(response.subject || "Payment Reminder");
          setBody(response.reminderText || response.body);
        } catch (error) {
          toast.error("Failed to generate reminder.");
          console.error("AI reminder error:", error);
          onClose();
        }
      };
      fetchReminder();
    }
  }, [isOpen, invoiceId, generateReminder, onClose]);

  const handleCopyToClipboard = () => {
    const textToCopy = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(textToCopy);
    setHasCopied(true);
    toast.success("Reminder copied to clipboard");
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    if (!invoiceId || !subject || !body) {
      toast.error("Subject and body are required");
      return;
    }

    try {
      const response = await sendReminder({ 
        invoiceId, 
        subject,
        body 
      }).unwrap();
      
      toast.success(`Reminder email sent to ${response.sentTo || 'client'}!`);
      onClose();
    } catch (error) {
      toast.error("Failed to send reminder email.");
      console.error("Send reminder error:", error);
    }
  };

  const isLoading = isGenerating || isSending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI-Generated Reminder">
      <div className="p-6">
        {isGenerating ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center mb-2">
              <Mail className="w-5 h-5 mr-2 text-blue-900" />
              <p className="text-sm text-slate-600">
                Your AI-generated payment reminder email
              </p>
            </div>

            <InputField
              label="Subject"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
            />

            <TextareaField
              label="Email Body"
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
            />

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={handleCopyToClipboard}
                icon={hasCopied ? Check : Copy}
                disabled={isLoading || !body}
              >
                {hasCopied ? "Copied" : "Copy Text"}
              </Button>
              <Button
                onClick={handleSendEmail}
                icon={Send}
                disabled={isLoading || !subject || !body}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Email"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ReminderModel;