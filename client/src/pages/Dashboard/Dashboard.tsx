import { Banknote, FileText, Plus } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { format } from "date-fns";
import { useGetAllInvoicesQuery } from "../../redux/features/invoice/invoiceApi";
import AIInsightsCard from "../../components/ui/AllInsightsCard";
import { addThousandsSeparator } from "../../utils/helper";
import Loading from "../../components/ui/Loading";

const Dashboard = () => {
  const navigate = useNavigate();

  // Fetch all invoices using RTK Query
  const { data: invoicesData, isLoading, isError } = useGetAllInvoicesQuery();

  const invoices = React.useMemo(() => {
    return invoicesData?.invoices || [];
  }, [invoicesData]);

  // Calculate stats from invoices
  const stats = React.useMemo(() => {
    const totalInvoices = invoices.length;
    const totalPaid = invoices
      .filter((inv) => inv.status === "Paid")
      .reduce((acc, inv) => acc + inv.total, 0);
    const totalUnpaid = invoices
      .filter((inv) => inv.status !== "Paid")
      .reduce((acc, inv) => acc + inv.total, 0);

    return { totalInvoices, totalPaid, totalUnpaid };
  }, [invoices]);

  // Get recent invoices (last 5, sorted by date)
  const recentInvoices = React.useMemo(() => {
    return [...invoices]
      .sort(
        (a, b) =>
          new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
      )
      .slice(0, 5);
  }, [invoices]);

  const statsData = [
    {
      icon: FileText,
      label: "Total Invoices",
      value: stats.totalInvoices,
      color: "blue" as const,
    },
    {
      icon: Banknote,
      label: "Total Paid",
      value: `₦${addThousandsSeparator(stats.totalPaid)}`,
      color: "emerald" as const,
    },
    {
      icon: Banknote,
      label: "Total Unpaid",
      value: `₦${addThousandsSeparator(stats.totalUnpaid)}`,
      color: "red" as const,
    },
  ];

  const colorClasses = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
    red: { bg: "bg-red-100", text: "text-red-600" },
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Failed to load dashboard data
        </h3>
        <p className="text-slate-500 mb-6">
          There was an error loading your dashboard. Please try again.
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900"> Dashboard </h2>
        <p className="text-sm text-slate-600 mt-1">
          A quick overview of your business finances.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-lg shadow-gray-100"
          >
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 w-12 h-12 ${
                  colorClasses[stat.color].bg
                } rounded-lg flex items-center justify-center`}
              >
                <stat.icon
                  className={`w-6 h-6 ${colorClasses[stat.color].text}`}
                />
              </div>
              <div className="ml-4 min-w-0">
                <div className="text-sm font-medium text-slate-500 truncate">
                  {stat.label}
                </div>
                <div className="text-2xl font-bold text-slate-900 break-words">
                  {stat.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights Card */}
      <AIInsightsCard />

      {/* Recent Invoices */}
      <div className="w-full bg-white border border-slate-200 rounded-lg shadow-sm shadow-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">
            Recent Invoices
          </h3>
          <Button variant="ghost" onClick={() => navigate("/invoices")}>
            View all
          </Button>
        </div>

        {recentInvoices.length > 0 ? (
          <div className="w-[90vw] md:w-auto overflow-x-auto">
            <table className="w-full min-w-[600px] divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {recentInvoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate(`/invoice/${invoice._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {invoice.billTo.clientName}
                      </div>
                      <div className="text-sm text-slate-500">
                        #{invoice.invoiceNumber}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                      ₦{invoice.total.toFixed(2)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === "Paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : invoice.status === "Pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No invoice yet
            </h3>
            <p className="text-slate-500 mb-6 max-w-md">
              You haven't created any invoices yet. Get started by creating your
              first one.
            </p>
            <Button onClick={() => navigate("/invoices/new")} icon={Plus}>
              Create Invoice
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
