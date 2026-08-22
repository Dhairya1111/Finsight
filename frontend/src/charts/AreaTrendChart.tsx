import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function AreaTrendChart({
  data,
  xKey,
  yKey,
  color = "#16a34a",
}: {
  data: Record<string, string | number | null>[];
  xKey: string;
  yKey: string;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
      >
        <defs>
          <linearGradient id={`gradient-${yKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0.04} />
          </linearGradient>
        </defs>
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
        />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          fill={`url(#gradient-${yKey})`}
          strokeWidth={2.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
