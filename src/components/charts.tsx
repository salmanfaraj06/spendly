"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
} from "recharts";

export function TrendChart({ data }: { data: { month: string; spend: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a35a" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#16a35a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          tick={{ fill: "#93a098", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ stroke: "#cfd8d2" }}
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #e6eae6",
            borderRadius: 12,
            color: "#16201b",
            fontSize: 12,
            boxShadow: "0 8px 24px -12px rgba(20,60,38,0.18)",
          }}
          formatter={(v) => [`LKR ${Number(v).toLocaleString()}`, "Spend"]}
        />
        <Area
          type="monotone"
          dataKey="spend"
          stroke="#16a35a"
          strokeWidth={2.5}
          fill="url(#trendFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryBars({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: "#93a098", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <Tooltip
          cursor={{ fill: "rgba(22,163,90,0.06)" }}
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #e6eae6",
            borderRadius: 12,
            color: "#16201b",
            fontSize: 12,
            boxShadow: "0 8px 24px -12px rgba(20,60,38,0.18)",
          }}
          formatter={(v) => [`LKR ${Number(v).toLocaleString()}`, "Spent"]}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
