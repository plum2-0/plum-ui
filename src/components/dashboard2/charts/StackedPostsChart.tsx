"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import KeywordTooltip from "./KeywordTooltip";

interface StackedPostsChartProps {
  data: any[];
  onBarClick?: (keyword: string) => void;
  onViewPosts?: (keyword: string) => void;
}

export default function StackedPostsChart({
  data,
  onBarClick,
  onViewPosts,
}: StackedPostsChartProps) {
  // Value-based liquid glass gradients with common base (blue) and mid (purple)
  const hexToRgb = (hex: string) => {
    const cleaned = hex.replace("#", "");
    const bigint = parseInt(cleaned, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  };
  const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (v: number) => v.toString(16).padStart(2, "0");
    return `#${toHex(Math.round(r))}${toHex(Math.round(g))}${toHex(
      Math.round(b)
    )}`;
  };
  const mixColors = (a: string, b: string, t: number) => {
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    const r = ca.r + (cb.r - ca.r) * t;
    const g = ca.g + (cb.g - ca.g) * t;
    const bCh = ca.b + (cb.b - ca.b) * t;
    return rgbToHex(r, g, bCh);
  };

  const baseStart = "#9CA3AF"; // constant sleek grey base at bottom
  const purple = "#8B5CF6"; // mid accent
  const green = "#10B981"; // high end
  const grey = "#4B5563"; // low end

  const totals = (Array.isArray(data) ? data : []).map((d: any) =>
    Number(d?.total ?? 0)
  );
  const minTotal = totals.length ? Math.min(...totals) : 0;
  const maxTotal = totals.length ? Math.max(...totals) : 0;
  const normalize = (v: number) =>
    maxTotal > minTotal ? (v - minTotal) / (maxTotal - minTotal) : 0;

  const barGradients = (Array.isArray(data) ? data : []).map((d: any) => {
    const t = normalize(Number(d?.total ?? 0));
    let endColor: string;
    if (t <= 0.5) {
      // interpolate grey → purple for lower half
      const s = t / 0.5;
      endColor = mixColors(grey, purple, s);
    } else {
      // interpolate purple → green for upper half
      const s = (t - 0.5) / 0.5;
      endColor = mixColors(purple, green, s);
    }
    // Force a clearly purple mid stop to avoid bluish cast
    const midColor = purple;
    return { start: baseStart, mid: midColor, end: endColor };
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
      >
        <defs>
          {/* Liquid glass gradient definitions */}
          {barGradients.map((gradient, index) => (
            <linearGradient
              key={index}
              id={`barGradient${index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={gradient.end} stopOpacity={0.9} />
              <stop
                offset="50%"
                stopColor={(gradient as any).mid || gradient.end}
                stopOpacity={0.6}
              />
              <stop
                offset="100%"
                stopColor={gradient.start}
                stopOpacity={0.3}
              />
            </linearGradient>
          ))}

          {/* Neumorphic glow effect */}
          <filter id="neumorphicGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <CartesianGrid
          strokeDasharray="0"
          stroke="rgba(255, 255, 255, 0.02)"
          vertical={false}
        />

        <XAxis
          dataKey="name"
          tick={{
            fill: "rgba(255, 255, 255, 0.5)",
            fontSize: 11,
            fontWeight: 300,
          }}
          axisLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
          angle={-45}
          textAnchor="end"
          height={100}
        />

        <YAxis
          tick={{
            fill: "rgba(255, 255, 255, 0.5)",
            fontSize: 11,
            fontWeight: 300,
          }}
          axisLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
          label={{
            value: "Posts",
            angle: -90,
            position: "insideLeft",
            style: {
              fill: "rgba(255, 255, 255, 0.4)",
              fontSize: 11,
              fontWeight: 300,
            },
          }}
        />

        {/* Tooltip with custom content */}
        <Tooltip
          content={<KeywordTooltip onViewPosts={onViewPosts} />}
          cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
        />

        {/* Single bar showing total with gradient */}
        <Bar
          dataKey="total"
          fill="url(#barGradient0)"
          radius={[12, 12, 0, 0]}
          filter="url(#neumorphicGlow)"
          onClick={(data: any) => {
            if (onBarClick && data?.fullName) {
              onBarClick(data.fullName);
            }
          }}
          style={{ cursor: "pointer" }}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={`url(#barGradient${index % barGradients.length})`}
              style={{ cursor: "pointer" }}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
