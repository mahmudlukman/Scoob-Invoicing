import { parse, compareAsc } from "date-fns";
import { addThousandsSeparator, currency } from "../../utils/helper";
import CustomBarChart from "../Charts/CustomBarChart";

interface DataItem {
  month: string;
  revenue: number;
}
interface RevenueByMonthChartProps {
  data: DataItem[];
  currencyCode?: string;
}
const RevenueByMonthChart = ({
  data,
  currencyCode = "NGN",
}: RevenueByMonthChartProps) => {
  const chartData = [...data]
    .sort((a, b) => {
      const dateA = parse(a.month, "MMM yyyy", new Date());
      const dateB = parse(b.month, "MMM yyyy", new Date());
      return compareAsc(dateA, dateB);
    })
    .map((item) => ({ month: item.month, amount: item.revenue }));
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 col-span-1">
      {" "}
      <div className="flex items-center justify-between">
        {" "}
        <h5 className="text-lg">Revenue by Month</h5>{" "}
        <span className="text-xs text-gray-400 font-medium">
          {" "}
          {currencyCode === "NGN" ? currency : currencyCode}{" "}
          {addThousandsSeparator(totalRevenue)} total{" "}
        </span>{" "}
      </div>{" "}
      <CustomBarChart data={chartData} />{" "}
    </div>
  );
};
export default RevenueByMonthChart;
