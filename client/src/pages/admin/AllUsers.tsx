import { useMemo, useState, useEffect } from "react";
import { AlertCircle, Loader2, Search, Users, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Button from "../../components/ui/Button";
import {
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} from "../../redux/features/user/userApi";
import { useSelector } from "react-redux";
import type { RootState, ServerError, User } from "../../@types";
import toast from "react-hot-toast";
import Tooltip from "../../components/ui/Tooltip";

const AllUsers = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // For immediate controlled input value
  const [search, setSearch] = useState(""); // Debounced value passed to query
  const [role, setRole] = useState("all");
  const [isActive, setIsActive] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Grab the logged-in user profile to prevent self-destructive operations
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  // Debounce search string to limit API performance bottlenecking
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      setSearch(searchTerm);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const { data, isLoading, isError } = useGetAllUsersQuery({
    page,
    pageSize: 10,
    search,
    role,
    isActive,
  });

  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  const users = useMemo(() => data?.users || [], [data]);

  const handleStatusToggle = async (user: User) => {
    if (user._id === currentUser?._id) {
      toast.error("You cannot deactivate your own administrative account.");
      return;
    }
    try {
      setActionLoading(user._id);
      await updateUserStatus({
        data: { id: user._id, role: user.role, isActive: !user.isActive },
      }).unwrap();
      toast.success("User status updated");
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError.data?.message ||
          serverError.message ||
          "Failed to update user status",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (user: User, newRole: "admin" | "user") => {
    if (user._id === currentUser?._id && newRole !== "admin") {
      toast.error("You cannot demote yourself from the admin group.");
      return;
    }
    try {
      setActionLoading(user._id);
      await updateUserStatus({
        data: { id: user._id, role: newRole, isActive: user.isActive },
      }).unwrap();
      toast.success("User role updated");
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError.data?.message ||
          serverError.message ||
          "Failed to update user role",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    userId: string | null;
  }>({ open: false, userId: null });

  const handleDeleteUser = async () => {
    if (!deleteModal.userId) return;
    if (deleteModal.userId === currentUser?._id) {
      toast.error("You cannot delete your own profile.");
      setDeleteModal({ open: false, userId: null });
      return;
    }
    try {
      setActionLoading(deleteModal.userId);
      await deleteUser(deleteModal.userId).unwrap();
      toast.success("User deleted successfully");
      setDeleteModal({ open: false, userId: null });
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError.data?.message ||
          serverError.message ||
          "Failed to delete user",
      );
    } finally {
      setActionLoading(null);
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
          Failed to load users
        </h3>
        <p className="text-slate-500 mb-6">There was an error loading users.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">All Users</h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage all registered users.
        </p>
      </div>

      {/* Filters Form Controls */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={role}
              onChange={(e) => {
                setPage(1);
                setRole(e.target.value);
              }}
              className="h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>

            <select
              value={isActive}
              onChange={(e) => {
                setPage(1);
                setIsActive(e.target.value);
              }}
              className="h-10 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Empty Content State */}
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">
              No users found
            </h3>
            <p className="text-slate-500 mt-2">
              No users match your search criteria.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Viewports Container card design */}
            <div className="md:hidden space-y-4 p-4">
              {users.map((user: User) => {
                const isSelf = user._id === currentUser?._id;
                return (
                  <div
                    key={user._id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        {user.name}
                        {isSelf && (
                          <span className="text-xs bg-blue-50 text-blue-600 font-normal px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500 break-all">
                        {user.email}
                      </p>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Role</span>
                        <select
                          value={user.role}
                          disabled={actionLoading === user._id || isSelf}
                          onChange={(e) =>
                            handleRoleChange(
                              user,
                              e.target.value as "admin" | "user",
                            )
                          }
                          className="border border-slate-200 rounded-md px-2 py-1 text-sm bg-white disabled:opacity-60"
                        >
                          <option value="admin">Admin</option>
                          <option value="user">User</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Status</span>
                        <button
                          disabled={actionLoading === user._id || isSelf}
                          onClick={() => handleStatusToggle(user)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                            user.isActive ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              user.isActive ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Joined</span>
                        <span className="text-sm text-slate-700">
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
                      <button
                        onClick={() =>
                          setDeleteModal({ open: true, userId: user._id })
                        }
                        disabled={actionLoading === user._id || isSelf}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40"
                      >
                        {actionLoading === user._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Tables layout viewports */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {users.map((user: User) => {
                    const isSelf = user._id === currentUser?._id;
                    return (
                      <tr key={user._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-medium text-slate-900 text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {user.name}
                            {isSelf && (
                              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-normal">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Tooltip
                            text={
                              isSelf
                                ? "Self editing locked"
                                : "Toggle User Role"
                            }
                            position="top"
                          >
                            <select
                              value={user.role}
                              disabled={actionLoading === user._id || isSelf}
                              onChange={(e) =>
                                handleRoleChange(
                                  user,
                                  e.target.value as "admin" | "user",
                                )
                              }
                              className="border border-slate-200 rounded-md px-2 py-1 text-sm bg-white disabled:opacity-60 focus:outline-none"
                            >
                              <option value="admin">Admin</option>
                              <option value="user">User</option>
                            </select>
                          </Tooltip>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Tooltip
                            text={
                              isSelf
                                ? "Self editing locked"
                                : "Toggle User Status"
                            }
                            position="top"
                          >
                            <button
                              disabled={actionLoading === user._id || isSelf}
                              onClick={() => handleStatusToggle(user)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                                user.isActive
                                  ? "bg-emerald-500"
                                  : "bg-slate-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  user.isActive
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          </Tooltip>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <Tooltip
                            text={
                              isSelf
                                ? "Cannot delete account self"
                                : "Delete User"
                            }
                            position="top"
                          >
                            <button
                              onClick={() =>
                                setDeleteModal({ open: true, userId: user._id })
                              }
                              disabled={actionLoading === user._id || isSelf}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40"
                            >
                              {actionLoading === user._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </Tooltip>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Server Driven Pagination Elements */}
        {data?.pagination && (
          <div className="flex justify-between items-center p-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Page {data.pagination.currentPage} of {data.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={!data.pagination.hasPrevPage}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={!data.pagination.hasNextPage}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal Layer */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden border border-slate-100">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Delete User
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to delete this user? This action cannot be
                undone and will revoke all access privileges.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteModal({ open: false, userId: null })}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteUser}
                  disabled={actionLoading === deleteModal.userId}
                >
                  {actionLoading === deleteModal.userId ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    "Delete User"
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

export default AllUsers;
