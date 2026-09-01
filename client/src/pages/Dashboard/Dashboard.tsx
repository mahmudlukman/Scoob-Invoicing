import { Banknote, FileText, Plus } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { format } from "date-fns";
import { useGetAllInvoicesQuery } from "../../redux/features/invoice/invoiceApi";
import AIInsightsCard from "../../components/ui/AllInsightsCard";
import { addThousandsSeparator } from "../../utils/helper";
import Loading from "../../components/ui/Loading";
import IncomeByMonthChart from "../../components/analytics/IncomeByMonth";
import type { Invoice } from "../../@types";

const statusBadgeClasses = (status: string) =>
  `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    status === "Paid"
      ? "bg-emerald-100 text-emerald-800"
      : status === "Pending"
        ? "bg-amber-100 text-amber-800"
        : "bg-red-100 text-red-800"
  }`;

interface CurrencyStats {
  code: string;
  symbol: string;
  totalPaid: number;
  totalUnpaid: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: invoicesData, isLoading, isError } = useGetAllInvoicesQuery();

  const invoices = React.useMemo(() => {
    return invoicesData?.invoices || [];
  }, [invoicesData]);

  // Calculate stats from invoices
  const stats = React.useMemo(() => {
    const totalInvoices = invoices.length;

    // Group by currency so mixed-currency totals never get summed together —
    // ₦100 + $100 is not a meaningful number.
    const byCurrency = new Map<string, CurrencyStats>();

    invoices.forEach((inv: Invoice) => {
      const code = inv.currency?.code || "NGN";
      const symbol = inv.currency?.symbol || "₦";

      if (!byCurrency.has(code)) {
        byCurrency.set(code, { code, symbol, totalPaid: 0, totalUnpaid: 0 });
      }
      const entry = byCurrency.get(code)!;

      if (inv.status === "Paid") {
        entry.totalPaid += inv.total;
      } else {
        entry.totalUnpaid += inv.total;
      }
    });

    return {
      totalInvoices,
      currencyBreakdown: Array.from(byCurrency.values()),
    };
  }, [invoices]);

  // Get recent invoices (last 5, sorted by date)
  const recentInvoices = React.useMemo(() => {
    return [...invoices]
      .sort(
        (a, b) =>
          new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime(),
      )
      .slice(0, 5);
  }, [invoices]);

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
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-lg shadow-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4 min-w-0">
              <div className="text-sm font-medium text-slate-500 truncate">
                Total Invoices
              </div>
              <div className="text-2xl font-bold text-slate-900 break-words">
                {stats.totalInvoices}
              </div>
            </div>
          </div>
        </div>

        {stats.currencyBreakdown.map((c) => (
          <React.Fragment key={c.code}>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-lg shadow-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="ml-4 min-w-0">
                  <div className="text-sm font-medium text-slate-500 truncate">
                    Total Paid
                    {stats.currencyBreakdown.length > 1 ? ` (${c.code})` : ""}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 break-words">
                    {c.symbol}
                    {addThousandsSeparator(c.totalPaid)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-lg shadow-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4 min-w-0">
                  <div className="text-sm font-medium text-slate-500 truncate">
                    Total Unpaid
                    {stats.currencyBreakdown.length > 1 ? ` (${c.code})` : ""}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 break-words">
                    {c.symbol}
                    {addThousandsSeparator(c.totalUnpaid)}
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* AI Insights Card */}
      <AIInsightsCard />

      {/* Income by Month Chart */}
      <IncomeByMonthChart />

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
          <>
            {/* Mobile: stacked cards (below md) */}
            <div className="md:hidden divide-y divide-slate-200">
              {recentInvoices.map((invoice) => {
                const symbol = invoice.currency?.symbol || "₦";
                return (
                  <div
                    key={invoice._id}
                    className="p-4 space-y-3 cursor-pointer active:bg-slate-50"
                    onClick={() => navigate(`/invoice/${invoice._id}`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {invoice.billTo.clientName}
                        </p>
                        <p className="text-sm text-slate-500 truncate mt-0.5">
                          #{invoice.invoiceNumber}
                        </p>
                      </div>
                      <span className={statusBadgeClasses(invoice.status)}>
                        {invoice.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Amount</p>
                        <p className="text-sm font-semibold text-slate-900 tabular-nums">
                          {symbol}
                          {addThousandsSeparator(
                            Number(invoice.total.toFixed(2)),
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Due Date</p>
                        <p className="text-sm text-slate-600 tabular-nums">
                          {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop/tablet: table (md and up) */}
            <div className="hidden md:block overflow-x-auto">
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
                  {recentInvoices.map((invoice) => {
                    const symbol = invoice.currency?.symbol || "₦";
                    return (
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

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 tabular-nums">
                          {symbol}
                          {addThousandsSeparator(
                            Number(invoice.total.toFixed(2)),
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={statusBadgeClasses(invoice.status)}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 tabular-nums">
                          {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
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
