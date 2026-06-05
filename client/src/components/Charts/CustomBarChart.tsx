import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartDataItem {
  month: string;
  amount: number;
}

interface CustomBarChartProps {
  data: ChartDataItem[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataItem;
    value: number;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
        <p className="text-sm text-gray-600">
          Inspections:{" "}
          <span className="text-sm font-medium text-gray-900">
            {payload[0].payload.amount.toLocaleString()}
          </span>
        </p>
      </div>
    );
  }

  return null;
};

const CustomBarChart: React.FC<CustomBarChartProps> = ({ data }) => {
  return (
    <div className="bg-white mt-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid stroke="none" />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#555" }}
            stroke="none"
          />

          <YAxis
            tick={{ fontSize: 12, fill: "#555" }}
            stroke="none"
            allowDecimals={false}
            tickCount={6}
          />

          <Tooltip content={<CustomTooltip />} />
          
          <Bar dataKey="amount" radius={[10, 10, 0, 0]} fill="#875cf5">
            {data.map((entry, index) => {
              const color = index % 2 === 0 ? "#875cf5" : "#cfbefb";

              return <rect key={index} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
