import { useMemo, useState } from "react";
import {
  AlertCircle,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import Button from "../../components/ui/Button";
import InputField from "../../components/ui/InputField";
import TextareaField from "../../components/ui/TextareaField";
import {
  useGetCustomersQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useCreateCustomerMutation,
} from "../../redux/features/customer/customerApi";
import type { Customer } from "../../redux/features/customer/customerApi";
import type { ServerError } from "../../@types";
import toast from "react-hot-toast";

interface CustomerFormState {
  clientName: string;
  email: string;
  address: string;
  phone: string;
}

const emptyCustomerForm: CustomerFormState = {
  clientName: "",
  email: "",
  address: "",
  phone: "",
};

const AllCustomers = () => {
  const { data: customersData, isLoading, isError } = useGetCustomersQuery();
  const [updateCustomer, { isLoading: isUpdating }] =
    useUpdateCustomerMutation();
  const [deleteCustomer, { isLoading: isDeleting }] =
    useDeleteCustomerMutation();
  const [createCustomer, { isLoading: isCreating }] =
    useCreateCustomerMutation();

  const [searchTerm, setSearchTerm] = useState("");

  const [editModal, setEditModal] = useState<{
    open: boolean;
    customer: Customer | null;
  }>({ open: false, customer: null });

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [formState, setFormState] =
    useState<CustomerFormState>(emptyCustomerForm);

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    customerId: string | null;
  }>({ open: false, customerId: null });

  const customers = useMemo(() => {
    return customersData?.customers || [];
  }, [customersData]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (customer) =>
        customer.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [customers, searchTerm]);

  const handleOpenEdit = (customer: Customer) => {
    setFormState({
      clientName: customer.clientName,
      email: customer.email || "",
      address: customer.address || "",
      phone: customer.phone || "",
    });
    setEditModal({ open: true, customer });
  };

  const handleOpenCreate = () => {
    setFormState(emptyCustomerForm);
    setCreateModalOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editModal.customer) return;

    try {
      await updateCustomer({
        id: editModal.customer._id,
        data: formState,
      }).unwrap();
      toast.success("Customer updated successfully");
      setEditModal({ open: false, customer: null });
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError.data?.message ||
          serverError.message ||
          "Failed to update customer",
      );
    }
  };

  const handleCreateCustomer = async () => {
    if (!formState.clientName.trim()) {
      toast.error("Client name is required");
      return;
    }

    try {
      await createCustomer(formState).unwrap();
      toast.success("Customer created successfully");
      setCreateModalOpen(false);
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError.data?.message ||
          serverError.message ||
          "Failed to create customer",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.customerId) return;

    try {
      await deleteCustomer(deleteModal.customerId).unwrap();
      toast.success("Customer deleted successfully");
      setDeleteModal({ open: false, customerId: null });
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError.data?.message ||
          serverError.message ||
          "Failed to delete customer",
      );
    }
  };

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
          Failed to load customers
        </h3>
        <p className="text-slate-500 mb-6">
          There was an error loading your customers. Please try again.
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            All Customers
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your saved customer information.
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={Plus}>
          Add Customer
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No customers found
            </h3>
            <p className="text-slate-500 mb-6 max-w-md">
              {customers.length === 0
                ? "You haven't saved any customers yet. Add one to get started."
                : "Your search did not match any customers. Try adjusting your search."}
            </p>
            {customers.length === 0 && (
              <Button onClick={handleOpenCreate} icon={Plus}>
                Add First Customer
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile: stacked cards (below md) */}
            <div className="md:hidden divide-y divide-slate-200">
              {filteredCustomers.map((customer) => (
                <div key={customer._id} className="p-4 space-y-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {customer.clientName}
                    </p>
                    {customer.email && (
                      <p className="text-sm text-slate-600 truncate mt-0.5">
                        {customer.email}
                      </p>
                    )}
                    {customer.phone && (
                      <p className="text-sm text-slate-500 truncate mt-0.5">
                        {customer.phone}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="small"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleOpenEdit(customer)}
                      icon={Edit}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="ghost"
                      aria-label="Delete Customer"
                      onClick={() =>
                        setDeleteModal({ open: true, customerId: customer._id })
                      }
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop/tablet: table (md and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {customer.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {customer.email || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {customer.phone || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                        {customer.address || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="small"
                            variant="ghost"
                            aria-label="Edit Customer"
                            onClick={() => handleOpenEdit(customer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="small"
                            variant="ghost"
                            aria-label="Delete Customer"
                            onClick={() =>
                              setDeleteModal({
                                open: true,
                                customerId: customer._id,
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
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

      {/* Edit Customer Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Edit Customer
              </h3>

              <InputField
                label="Client Name"
                name="clientName"
                required
                value={formState.clientName}
                onChange={handleFormChange}
              />
              <InputField
                label="Email"
                type="email"
                name="email"
                value={formState.email}
                onChange={handleFormChange}
              />
              <TextareaField
                label="Address"
                name="address"
                value={formState.address}
                onChange={handleFormChange}
              />
              <InputField
                label="Phone"
                name="phone"
                value={formState.phone}
                onChange={handleFormChange}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setEditModal({ open: false, customer: null })}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} isLoading={isUpdating}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Customer Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Add Customer
              </h3>

              <InputField
                label="Client Name"
                name="clientName"
                required
                value={formState.clientName}
                onChange={handleFormChange}
              />
              <InputField
                label="Email"
                type="email"
                name="email"
                value={formState.email}
                onChange={handleFormChange}
              />
              <TextareaField
                label="Address"
                name="address"
                value={formState.address}
                onChange={handleFormChange}
              />
              <InputField
                label="Phone"
                name="phone"
                value={formState.phone}
                onChange={handleFormChange}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateCustomer} isLoading={isCreating}>
                  Add Customer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Delete Customer
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to delete this customer? This won't affect
                any invoices already created for them, but you'll need to
                re-enter their info manually next time.
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setDeleteModal({ open: false, customerId: null })
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
                    "Delete Customer"
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

export default AllCustomers;
