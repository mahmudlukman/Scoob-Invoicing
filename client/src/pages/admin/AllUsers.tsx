import { useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Search,
  Users,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";

import Button from "../../components/ui/Button";
import { useGetAllUsersQuery } from "../../redux/features/user/userApi";
import type { User } from "../../@types";

const AllUsers = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [isActive, setIsActive] = useState("all");

  const { data, isLoading, isError } = useGetAllUsersQuery({
    page,
    pageSize: 10,
    search,
    role,
    isActive,
  });

  const users = useMemo(() => data?.users || [], [data]);

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

      {/* Filters */}
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
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="w-full h-10 pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={role}
              onChange={(e) => {
                setPage(1);
                setRole(e.target.value);
              }}
              className="h-10 px-3 border border-slate-200 rounded-lg"
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
              className="h-10 px-3 border border-slate-200 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
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
          <div className="overflow-x-auto">
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
                {users.map((user: User) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {user.name}
                    </td>

                    <td className="px-6 py-4 text-slate-600">{user.email}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <UserCheck className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <UserX className="w-4 h-4" />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button size="small" variant="secondary">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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
    </div>
  );
};

export default AllUsers;
