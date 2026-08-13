import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Loader2,
  Lock,
  PauseCircle,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import InputField from "../../components/ui/InputField";
import {
  useDeleteAccountMutation,
  useDeactivateAccountMutation,
} from "../../redux/features/user/userApi";
import { useLogoutMutation } from "../../redux/features/auth/authApi";
import type { ServerError } from "../../@types";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [deactivateAccount, { isLoading: isDeactivating }] =
    useDeactivateAccountMutation();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");

  const canConfirmDelete =
    deleteConfirmText === "DELETE" && deletePassword.length > 0;

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteConfirmText("");
    setDeletePassword("");
  };

  const handleCloseDeactivateModal = () => {
    setDeactivateModalOpen(false);
    setDeactivatePassword("");
  };

  const handleDeleteAccount = async () => {
    if (!canConfirmDelete) return;
    try {
      await deleteAccount({ password: deletePassword }).unwrap();
      await logout({}).unwrap();
      navigate("/");
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError?.data?.message ||
          serverError?.message ||
          "Failed to delete account. Check your password and try again.",
      );
    }
  };

  const handleDeactivateAccount = async () => {
    if (!deactivatePassword) return;
    try {
      await deactivateAccount({ password: deactivatePassword }).unwrap();
      await logout({}).unwrap();
      navigate("/");
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError?.data?.message ||
          serverError?.message ||
          "Failed to deactivate account. Check your password and try again.",
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-600 mt-1">
          Manage your account preferences.
        </p>
      </div>

      {/* Deactivate — reversible pause */}
      <div className="bg-white border border-amber-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-amber-200 bg-amber-50">
          <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
            <PauseCircle className="w-5 h-5" />
            Deactivate Account
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium text-slate-900">Take a break</p>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                Deactivating signs you out and hides your account. Your
                invoices, customers, and data stay intact — log back in anytime
                to reactivate.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setDeactivateModalOpen(true)}
              icon={PauseCircle}
            >
              Deactivate Account
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone — permanent delete */}
      <div className="bg-white border border-red-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-red-200 bg-red-50">
          <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h3>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Delete your account
              </p>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                This permanently deletes your account along with all invoices,
                customers, and recurring invoices you've created. This action
                cannot be undone.
              </p>
            </div>
            <Button
              variant="danger"
              onClick={() => setDeleteModalOpen(true)}
              icon={Trash2}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={deactivateModalOpen}
        onClose={handleCloseDeactivateModal}
        title="Deactivate your account"
      >
        <div className="p-6 space-y-4 w-full max-w-md">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <PauseCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              You'll be signed out immediately. Log back in with your usual
              credentials whenever you're ready to reactivate — nothing is
              deleted.
            </p>
          </div>

          <InputField
            label="Confirm your password"
            name="deactivatePassword"
            type="password"
            icon={Lock}
            value={deactivatePassword}
            onChange={(e) => setDeactivatePassword(e.target.value)}
            placeholder="Enter your password"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={handleCloseDeactivateModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeactivateAccount}
              disabled={!deactivatePassword || isDeactivating}
            >
              {isDeactivating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deactivating...
                </span>
              ) : (
                "Deactivate Account"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Delete your account"
      >
        <div className="p-6 space-y-4 w-full max-w-md">
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              This will permanently delete your account, all invoices,
              customers, and recurring invoices. There is no way to recover this
              data afterward.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Type <span className="font-mono font-bold">DELETE</span> to
              confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full h-11 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <InputField
            label="Confirm your password"
            name="deletePassword"
            type="password"
            icon={Lock}
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Enter your password"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={handleCloseDeleteModal}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={!canConfirmDelete || isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Permanently Delete Account"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
