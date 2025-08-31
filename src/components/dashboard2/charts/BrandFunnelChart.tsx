"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";

export type BrandFunnelDatum = {
  name: string;
  value: number;
  color?: string;
};

interface BrandFunnelChartProps {
  data: BrandFunnelDatum[];
  colors?: string[];
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return `${value}`;
}

const DESCRIPTIONS: Record<string, string> = {
  "Total Posts Scraped": "All Reddit Posts found via keywords",
  "Total Leads Discovered": "Potential Leads facing relevant problems the Brand can help",
  "Total Leads Engaged": "Leads who you are actively engaged in a conversation",
  "Total Leads Converted": "Leads who you were engaged that converted as Customers",
  "Total Leads Dropped": "Leads who you were engaged that you deemed not worth pursuing anymore.",
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const datum = payload[0]?.payload as BrandFunnelDatum & { fill?: string };
  const name = datum?.name ?? "";
  const value = datum?.value ?? 0;
  const description = DESCRIPTIONS[name] ?? "";

  return (
    <div
      style={{
        background: "rgba(17, 24, 39, 0.92)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        color: "#fff",
        padding: "10px 12px",
        maxWidth: 320,
        boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            background: (datum as any)?.fill ?? "#8B5CF6",
            borderRadius: 3,
          }}
        />
        <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
        {formatNumber(Number(value))}
      </div>
      {description ? (
        <div style={{ fontSize: 12, lineHeight: 1.4, color: "rgba(255,255,255,0.8)" }}>
          {description}
        </div>
      ) : null}
    </div>
  );
}

export default function BrandFunnelChart({
  data,
  colors = [
    "#60A5FA",
    "#8B5CF6",
    "#22D3EE",
    "#F472B6",
    "#34D399",
  ],
}: BrandFunnelChartProps) {
  const hasValues = data.some((d) => d.value > 0);

  if (!hasValues) {
    return (
      <div className="min-h-[240px] flex items-center justify-center text-white/60 text-sm">
        No funnel data available
      </div>
    );
  }

  const chartData = data.map((d, idx) => ({
    ...d,
    fill: d.color ?? colors[idx % colors.length],
  }));

  return (
    <div className="w-full h-[360px]">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 32, bottom: 8, left: 8 }}
          barCategoryGap={18}
        >
          <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis
            type="number"
            tickFormatter={(v) => formatNumber(Number(v))}
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 14 }}
            tickMargin={6}
            width={180}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 6, 6]} minPointSize={2}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v: any) => formatNumber(Number(v))}
              fill="rgba(255,255,255,0.85)"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 