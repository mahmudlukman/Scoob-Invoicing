import { compareAsc, format } from "date-fns";
import CustomLineChart from "../Charts/CustomLineChart";
import Loading from "../ui/Loading";
import { currency } from "../../utils/helper";
import { useGetIncomeByMonthQuery } from "../../redux/features/invoice/invoiceApi";

interface DataItem {
  _id: { year: number; month: number };
  income: number;
  invoiceCount: number;
}

const IncomeByMonthChart = () => {
  const { data, isLoading, isError } = useGetIncomeByMonthQuery();

  const chartData = [...(data?.incomeByMonth || [])]
    .sort((a: DataItem, b: DataItem) => {
      const dateA = new Date(a._id.year, a._id.month - 1);
      const dateB = new Date(b._id.year, b._id.month - 1);
      return compareAsc(dateA, dateB);
    })
    .map((item: DataItem) => {
      const label = format(
        new Date(item._id.year, item._id.month - 1),
        "MMM yyyy",
      );
      return {
        month: label,
        value: item.income,
        label,
      };
    });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 col-span-1">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Income by Month</h5>
      </div>

      {isLoading ? (
        <div className="py-12">
          <Loading />
        </div>
      ) : isError ? (
        <p className="text-sm text-slate-500 py-12 text-center">
          Failed to load income data.
        </p>
      ) : chartData.length > 0 ? (
        <CustomLineChart
          data={chartData}
          strokeColor="#10b981"
          labelKey="Income"
          valuePrefix={currency}
        />
      ) : (
        <p className="text-sm text-slate-500 py-12 text-center">
          No paid invoices yet.
        </p>
      )}
    </div>
  );
};

export default IncomeByMonthChart;
