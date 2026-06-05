import CustomLineChart from "../Charts/CustomLineChart";
import { parse, compareAsc } from "date-fns";

interface DataItem {
  month: string;
  count: number;
}

const UsersGrowthChart = ({ data }: { data: DataItem[] }) => {
  // Sort data chronologically (oldest to newest)
  const sortedData = [...data].sort((a, b) => {
    const dateA = parse(a.month, "MMM yyyy", new Date());
    const dateB = parse(b.month, "MMM yyyy", new Date());
    return compareAsc(dateA, dateB);
  });

  const chartData = sortedData.map((item) => ({
    month: item.month,
    value: item.count,
  }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 col-span-1">
      <div className="flex items-center justify-between ">
        <h5 className="text-lg">Users Growth</h5>
      </div>
      <CustomLineChart
        data={chartData}
        strokeColor="#3b82f6"
        labelKey="Users"
      />
    </div>
  );
};

export default UsersGrowthChart;
