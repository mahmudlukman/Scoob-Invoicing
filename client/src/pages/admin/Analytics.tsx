import { UserCheck, ReceiptText, HandCoins, BanknoteX } from "lucide-react";
import { addThousandsSeparator, currency } from "../../utils/helper";
import { format } from "date-fns";
import { useGetAnalyticsQuery } from "../../redux/features/analytics/analyticsApi";
import Loading from "../../components/ui/Loading";
import InfoCard from "../../components/ui/InfoCard";
import UsersGrowthChart from "../../components/analytics/UsersByMonthChart";
import InvoiceOverview from "../../components/analytics/InvoiceOverview";
import RecentActivity from "../../components/analytics/RecentActivity";
import { useNavigate } from "react-router-dom";
import InvoicesByMonthChart from "../../components/analytics/InvoiceStatusChart";
import RevenueByMonthChart from "../../components/analytics/RevenueByMonthChart";
import TopUsers from "../../components/analytics/TopUsers";

interface UserGrowthItem {
  _id: {
    year: number;
    month: number;
  };
  count: number;
}

interface RevenueMonth {
  year: number;
  month: number;
  revenue: number;
  invoiceCount: number;
}

interface RevenueGrowthItem {
  currency: string;
  months: RevenueMonth[];
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface MonthlyInvoices {
  month: string;
  invoiceCount: number;
}

const Analytics = () => {
  const {
    data: analyticsData,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useGetAnalyticsQuery({});

  const navigate = useNavigate();

  const analytics = analyticsData?.analytics || [];

  const usersGrowth = (analytics?.users?.growth || []).map(
    (item: UserGrowthItem) => ({
      month: format(new Date(item._id.year, item._id.month - 1), "MMM yyyy"),
      count: item.count,
    }),
  );

  const invoiceStats = {
    paid: analytics?.invoices?.paid || 0,
    unpaid: analytics?.invoices?.unpaid || 0,
    pending: analytics?.invoices?.pending || 0,
    total: analytics?.invoices?.total || 0,
  };

  const revenueGrowth: RevenueGrowthItem[] = analytics?.revenue?.growth || [];

  const monthlyRevenue: MonthlyRevenue[] = revenueGrowth
    .flatMap((currencyData) =>
      currencyData.months.map((item) => ({
        month: format(new Date(item.year, item.month - 1), "MMM yyyy"),
        revenue: item.revenue,
      })),
    )
    .reduce<MonthlyRevenue[]>((acc, current) => {
      const existing = acc.find((item) => item.month === current.month);

      if (existing) {
        existing.revenue += current.revenue;
      } else {
        acc.push({ ...current });
      }

      return acc;
    }, []);

  const monthlyInvoices: MonthlyInvoices[] = revenueGrowth
    .flatMap((currencyData) =>
      currencyData.months.map((item) => ({
        month: format(new Date(item.year, item.month - 1), "MMM yyyy"),
        invoiceCount: item.invoiceCount,
      })),
    )
    .reduce<MonthlyInvoices[]>((acc, current) => {
      const existing = acc.find((item) => item.month === current.month);

      if (existing) {
        existing.invoiceCount += current.invoiceCount;
      } else {
        acc.push({ ...current });
      }

      return acc;
    }, []);

  const revenueByCurrency = analytics?.revenue?.byCurrency || [];

  const totalPaid = revenueByCurrency.reduce(
    (total: number, item: { paid: number }) => total + item.paid,
    0,
  );

  const totalUnpaid = revenueByCurrency.reduce(
    (total: number, item: { unpaid: number }) => total + item.unpaid,
    0,
  );

  // Handle error state
  if (isError) {
    console.log("Something went wrong. Please try again.", error);
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900"> Dashboard </h2>
        <p className="text-sm text-slate-600 mt-1">
          A quick overview of all activities.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <InfoCard
          icon={<UserCheck />}
          label="Total Users"
          value={analytics?.users?.total || 0}
          color="bg-blue-500"
        />
        <InfoCard
          icon={<ReceiptText />}
          label="Total Invoices"
          value={analytics?.invoices?.total || 0}
          color="bg-orange-500"
        />
        <InfoCard
          icon={<HandCoins />}
          label="Total Paid"
          value={`${currency}${addThousandsSeparator(totalPaid)}`}
          color="bg-cyan-500"
        />

        <InfoCard
          icon={<BanknoteX />}
          label="Total Unpaid"
          value={`${currency}${addThousandsSeparator(totalUnpaid)}`}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <UsersGrowthChart data={usersGrowth} />
        <InvoiceOverview {...invoiceStats} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <RevenueByMonthChart data={monthlyRevenue} />
        <InvoicesByMonthChart data={monthlyInvoices} />
      </div>
      <div className="grid grid-cols-1 gap-6 mt-6">
        <RecentActivity
          invoices={analytics?.recentActivity?.invoices || []}
          users={analytics?.recentActivity?.users || []}
          onSeeAllInvoices={() => navigate("/invoices")}
          onSeeAllUsers={() => navigate("/all-users")}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 mt-6">
        <TopUsers
          users={analytics?.topUsers || []}
          onSeeAll={() => navigate("/all-users")}
        />
      </div>

      {/* Optional: Add refresh button */}
      {isError && (
        <div className="mt-6 text-center">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry Loading Data
          </button>
        </div>
      )}
    </div>
  );
};

export default Analytics;
