import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

interface ChartDataItem {
  month: string;
  value: number;
  label?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataItem }>;
  labelKey?: string;
  valuePrefix?: string;
}

const CustomTooltip = ({
  active,
  payload,
  labelKey = "Users",
  valuePrefix = "",
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const { month, value, label } = payload[0].payload;

    return (
      <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
        <p className="text-xs font-semibold text-blue-700 mb-1">
          {label || month}
        </p>
        <p className="text-sm text-gray-600">
          {labelKey}:{" "}
          <span className="text-sm font-medium text-gray-900">
            {valuePrefix}
            {value}
          </span>
        </p>
      </div>
    );
  }

  return null;
};

interface CustomLineChartProps {
  data: ChartDataItem[];
  strokeColor?: string;
  labelKey?: string;
  valuePrefix?: string;
}

const CustomLineChart = ({
  data,
  strokeColor = "#3b82f6",
  labelKey = "Users",
  valuePrefix = "",
}: CustomLineChartProps) => {
  const gradientId = `gradient-${strokeColor.replace("#", "")}`;

  return (
    <div className="bg-white">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#555" }}
            stroke="none"
          />

          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#555" }}
            stroke="none"
            tickCount={6}
          />

          <Tooltip
            content={
              <CustomTooltip labelKey={labelKey} valuePrefix={valuePrefix} />
            }
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={3}
            fill={`url(#${gradientId})`}
            dot={{ r: 4, fill: strokeColor, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;
