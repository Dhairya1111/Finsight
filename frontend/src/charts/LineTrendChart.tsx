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
  color = "#38bdf8",
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
        <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
        <XAxis
          dataKey={xKey}
          stroke="#64748b"
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="#64748b" tickLine={false} axisLine={false} width={56} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#020617",
            border: "1px solid rgba(148,163,184,0.18)",
            borderRadius: 16,
          }}
          labelStyle={{ color: "#e2e8f0" }}
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
