import { LuArrowRight } from "react-icons/lu";
import RecentActivityCard from "../ui/RecentActivityCard";
import { format } from "date-fns";

interface InvoiceActivity {
  _id: string;
  invoiceNumber: string;
  status: "Paid" | "Unpaid" | "Pending";
  total: number;
  createdAt: string;
  billTo: { clientName: string };
  user: { name: string; businessName: string };
}

interface UserActivity {
  _id: string;
  name: string;
  email: string;
  businessName: string;
  createdAt: string;
}

interface RecentActivityProps {
  invoices: InvoiceActivity[];
  users: UserActivity[];
  onSeeAllInvoices: () => void;
  onSeeAllUsers: () => void;
}

const RecentActivity = ({
  invoices,
  users,
  onSeeAllInvoices,
  onSeeAllUsers,
}: RecentActivityProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Recent Invoices */}
      <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
        <div className="flex items-center justify-between">
          <h5 className="text-lg">Recent Invoices</h5>
          <button
            className="flex items-center gap-3 text-[12px] font-medium text-gray-700 hover:text-primary bg-gray-50 px-4 py-1.5 rounded-lg border border-gray-200/50 cursor-pointer"
            onClick={onSeeAllInvoices}
          >
            See All <LuArrowRight className="text-base" />
          </button>
        </div>
        <div className="mt-4">
          {invoices?.slice(0, 5).map((invoice) => (
            <RecentActivityCard
              key={invoice._id}
              type="invoice"
              name={invoice.billTo.clientName}
              subtitle={`${invoice.invoiceNumber} • ${invoice.user.businessName || invoice.user.name}`}
              date={format(new Date(invoice.createdAt), "MMM d, yyyy")}
              amount={invoice.total}
              status={invoice.status}
            />
          ))}
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
        <div className="flex items-center justify-between">
          <h5 className="text-lg">Recent Users</h5>
          <button
            className="flex items-center gap-3 text-[12px] font-medium text-gray-700 hover:text-primary bg-gray-50 px-4 py-1.5 rounded-lg border border-gray-200/50 cursor-pointer"
            onClick={onSeeAllUsers}
          >
            See All <LuArrowRight className="text-base" />
          </button>
        </div>
        <div className="mt-4">
          {users?.slice(0, 5).map((user) => (
            <RecentActivityCard
              key={user._id}
              type="user"
              name={user.name}
              subtitle={user.businessName || user.email}
              date={format(new Date(user.createdAt), "MMM d, yyyy")}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
