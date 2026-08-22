import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function LineTrendChart({
  data,
  xKey,
  yKey,
  color = "#1d4ed8",
}: {
  data: Record<string, string | number | null>[];
  xKey: string;
  yKey: string;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
      >
        <CartesianGrid stroke="rgba(148,163,184,0.22)" vertical={false} />
        <XAxis
          dataKey={xKey}
          stroke="#64748b"
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="#64748b" tickLine={false} axisLine={false} width={56} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
          }}
          labelStyle={{ color: "#0f172a" }}
        />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={3}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
