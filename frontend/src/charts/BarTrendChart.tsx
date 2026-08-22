import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function BarTrendChart({
  data,
  xKey,
  yKey,
  color = "#2b94f4",
}: {
  data: Record<string, string | number | null>[];
  xKey: string;
  yKey: string;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
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
        />
        <Bar dataKey={yKey} fill={color} radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
