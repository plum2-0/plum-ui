"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { motion } from "framer-motion";
import { getChartColors } from "@/utils/chartDataTransformations";

interface MultiLineChartProps {
  data: any[];
  lines: string[];
}

export default function MultiLineChart({ data, lines }: MultiLineChartProps) {
  const colors = getChartColors();
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <defs>
          {/* Liquid glass gradient with neumorphic feel */}
          <linearGradient id="liquidGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.6} />
            <stop offset="30%" stopColor="#8B5CF6" stopOpacity={0.3} />
            <stop offset="60%" stopColor="#3B82F6" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
          </linearGradient>
          
          {/* Glow filter for neumorphic effect */}
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <CartesianGrid
          strokeDasharray="0"
          stroke="rgba(255, 255, 255, 0.02)"
          vertical={false}
        />
        
        <XAxis
          dataKey="date"
          tick={{ 
            fill: "rgba(255, 255, 255, 0.5)", 
            fontSize: 11,
            fontWeight: 300
          }}
          axisLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
        />
        
        <YAxis
          tick={{ 
            fill: "rgba(255, 255, 255, 0.5)", 
            fontSize: 11,
            fontWeight: 300
          }}
          axisLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
          label={{
            value: lines[0] === "Posts" ? "Posts" : "Score",
            angle: -90,
            position: "insideLeft",
            style: { 
              fill: "rgba(255, 255, 255, 0.4)", 
              fontSize: 11,
              fontWeight: 300
            },
          }}
        />
        
        {/* Single smooth area with liquid glass effect */}
        {lines.slice(0, 1).map((line) => (
          <React.Fragment key={line}>
            <Area
              type="monotone"
              dataKey={line}
              stroke="none"
              fill="url(#liquidGradient)"
              animationDuration={2000}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey={line}
              stroke="rgba(139, 92, 246, 0.8)"
              strokeWidth={2.5}
              dot={false}
              filter="url(#lineGlow)"
              animationDuration={2000}
              animationEasing="ease-out"
              style={{
                filter: `drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))`,
              }}
            />
          </React.Fragment>
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}