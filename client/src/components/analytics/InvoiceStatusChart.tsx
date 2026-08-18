import { parse, compareAsc } from "date-fns";
import CustomLineChart from "../Charts/CustomLineChart";

interface DataItem {
  month: string;
  invoiceCount: number;
}
interface InvoicesByMonthChartProps {
  data: DataItem[];
}
const InvoicesByMonthChart = ({ data }: InvoicesByMonthChartProps) => {
  const chartData = [...data]
    .sort((a, b) => {
      const dateA = parse(a.month, "MMM yyyy", new Date());
      const dateB = parse(b.month, "MMM yyyy", new Date());
      return compareAsc(dateA, dateB);
    })
    .map((item) => ({ month: item.month, value: item.invoiceCount }));
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 col-span-1">
      {" "}
      <div className="flex items-center justify-between">
        {" "}
        <h5 className="text-lg">Invoices by Month</h5>{" "}
      </div>{" "}
      <CustomLineChart
        data={chartData}
        strokeColor="#875cf5"
        labelKey="Invoices"
      />{" "}
    </div>
  );
};
export default InvoicesByMonthChart;
