import { compareAsc } from "date-fns";
import CustomLineChart from "../Charts/CustomLineChart";

interface DataItem {
  _id: { year: number; month: number };
  revenue: number;
  invoiceCount: number;
}

const InvoicesByMonthChart = ({ data }: { data: DataItem[] }) => {
  const chartData = [...data]
    .sort((a, b) => {
      const dateA = new Date(a._id.year, a._id.month - 1);
      const dateB = new Date(b._id.year, b._id.month - 1);
      return compareAsc(dateA, dateB);
    })
    .map((item) => ({
      month: new Date(item._id.year, item._id.month - 1).toLocaleDateString(
        "en-US",
        { month: "short", year: "numeric" },
      ),
      value: item.invoiceCount,
    }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 col-span-1">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Invoices by Month</h5>
      </div>
      <CustomLineChart
        data={chartData}
        strokeColor="#875cf5"
        labelKey="Invoices"
      />
    </div>
  );
};

export default InvoicesByMonthChart;
