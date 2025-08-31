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
  prev?: number; // previous step absolute value (for % context)
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
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  // payload[0] may represent one of the stacked bars. We want the data item.
  const datum = payload[0]?.payload as any;
  const name = datum?.name ?? "";
  const actual = Number(datum?.actual ?? 0);
  const prev = Number(datum?.prev ?? actual);
  const pct = prev > 0 ? Math.round((actual / prev) * 1000) / 10 : 0;
  const description = DESCRIPTIONS[name] ?? "";

  return (
    <div
      style={{
        background: "rgba(17, 24, 39, 0.92)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        color: "#fff",
        padding: "10px 12px",
        maxWidth: 340,
        boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{name}</div>
      <div style={{ fontSize: 16 }}>
        {formatNumber(actual)} of {formatNumber(prev)} ({pct}%)
      </div>
      {description ? (
        <div style={{ fontSize: 12, lineHeight: 1.4, color: "rgba(255,255,255,0.8)", marginTop: 6 }}>
          {description}
        </div>
      ) : null}
    </div>
  );
}

function CategoryTick(props: any) {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        transform="rotate(-25)"
        fill="rgba(255,255,255,0.75)"
        fontSize={12}
      >
        {payload?.value}
      </text>
    </g>
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

  // Build chart data with actual and remainder so total height equals previous step
  const chartData = data.map((d, idx) => {
    const prev = typeof d.prev === "number" ? d.prev : d.value;
    const actual = d.value;
    const remainder = Math.max(prev - actual, 0);
    const fill = d.color ?? colors[idx % colors.length];
    return { name: d.name, actual, remainder, prev, fill };
  });

  const actualFills = chartData.map((d) => d.fill);
  const remainderFills = chartData.map(() => "rgba(255,255,255,0.18)");

  // Custom label rendering percentage on top of actual portion
  const renderPercentLabel = (props: any) => {
    const { x, y, width, value, index } = props;
    const prev = Number(chartData[index]?.prev ?? value);
    const pct = prev > 0 ? Math.round((Number(value) / prev) * 1000) / 10 : 0;
    if (isNaN(x) || isNaN(y) || isNaN(width)) return null;
    return (
      <text
        x={x + width / 2}
        y={y - 6}
        textAnchor="middle"
        fill="rgba(255,255,255,0.9)"
        fontSize={12}
        fontWeight={600}
      >
        {pct}%
      </text>
    );
  };

  return (
    <div className="w-full h-[380px]">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 24, bottom: 84, left: 16 }}
          barCategoryGap={24}
        >
          <CartesianGrid vertical={true} horizontal={true} stroke="rgba(255,255,255,0.06)" />
          <XAxis
            type="category"
            dataKey="name"
            interval={0}
            tick={<CategoryTick />}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
            height={64}
            tickMargin={12}
          />
          <YAxis
            type="number"
            tickFormatter={(v) => formatNumber(Number(v))}
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Actual value (colored) at the bottom */}
          <Bar dataKey="actual" stackId="f" radius={[0, 0, 0, 0]} minPointSize={2}>
            {actualFills.map((fill, i) => (
              <Cell key={`act-${i}`} fill={fill} />
            ))}
            <LabelList dataKey="actual" content={renderPercentLabel} />
          </Bar>

          {/* Remainder to reach previous step height (ghost) on top */}
          <Bar dataKey="remainder" stackId="f" radius={[6, 6, 0, 0]}>
            {remainderFills.map((fill, i) => (
              <Cell key={`rem-${i}`} fill={fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 