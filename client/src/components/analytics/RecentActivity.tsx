import { LuArrowRight, LuFileText, LuUser } from "react-icons/lu";
import RecentActivityCard from "../ui/RecentActivityCard";
import { format } from "date-fns";

interface InvoiceActivity {
  _id: string;
  invoiceNumber: string;
  status: "Paid" | "Unpaid" | "Pending";
  total: number;
  createdAt: string;
  billTo?: { clientName?: string };
  user?: { name?: string; businessName?: string };
}

interface UserActivity {
  _id: string;
  name: string;
  email: string;
  businessName?: string;
  createdAt: string;
}

interface RecentActivityProps {
  invoices?: InvoiceActivity[];
  users?: UserActivity[];
  onSeeAllInvoices: () => void;
  onSeeAllUsers: () => void;
}

const RecentActivity = ({
  invoices = [],
  users = [],
  onSeeAllInvoices,
  onSeeAllUsers,
}: RecentActivityProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Recent Invoices Card */}
      <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                Recent Invoices
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest billing activities
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/80 transition-colors cursor-pointer shrink-0"
              onClick={onSeeAllInvoices}
            >
              <span>See All</span>
              <LuArrowRight className="text-sm" />
            </button>
          </div>

          <div className="mt-3 sm:mt-4 space-y-2">
            {invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                  <LuFileText className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">
                  No recent invoices
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Invoices created recently will appear here.
                </p>
              </div>
            ) : (
              invoices.slice(0, 5).map((invoice) => {
                const clientName =
                  invoice.billTo?.clientName || "Unnamed Client";
                const creator =
                  invoice.user?.businessName || invoice.user?.name || "N/A";
                const formattedDate = invoice.createdAt
                  ? format(new Date(invoice.createdAt), "MMM d, yyyy")
                  : "N/A";

                return (
                  <RecentActivityCard
                    key={invoice._id}
                    type="invoice"
                    name={clientName}
                    subtitle={`${invoice.invoiceNumber} • ${creator}`}
                    date={formattedDate}
                    amount={invoice.total}
                    status={invoice.status}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Users Card */}
      <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                Recent Users
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Newly registered accounts
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/80 transition-colors cursor-pointer shrink-0"
              onClick={onSeeAllUsers}
            >
              <span>See All</span>
              <LuArrowRight className="text-sm" />
            </button>
          </div>

          <div className="mt-3 sm:mt-4 space-y-2">
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                  <LuUser className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">
                  No recent users
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  New registrations will show up here.
                </p>
              </div>
            ) : (
              users.slice(0, 5).map((user) => {
                const formattedDate = user.createdAt
                  ? format(new Date(user.createdAt), "MMM d, yyyy")
                  : "N/A";

                return (
                  <RecentActivityCard
                    key={user._id}
                    type="user"
                    name={user.name || "Unknown User"}
                    subtitle={user.businessName || user.email}
                    date={formattedDate}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
