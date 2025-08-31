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
import { getChartColors } from "@/utils/chartDataTransformations";
import KeywordTooltip from "./KeywordTooltip";

interface StackedPostsChartProps {
  data: any[];
  onBarClick?: (keyword: string) => void;
  onViewPosts?: (keyword: string) => void;
}

export default function StackedPostsChart({ 
  data, 
  onBarClick,
  onViewPosts 
}: StackedPostsChartProps) {
  const colors = getChartColors();
  
  // Generate liquid glass gradients for each bar
  const barGradients = colors.gradients;
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
      >
        <defs>
          {/* Liquid glass gradient definitions */}
          {barGradients.map((gradient, index) => (
            <linearGradient key={index} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradient.start} stopOpacity={0.9} />
              <stop offset="50%" stopColor={gradient.start} stopOpacity={0.6} />
              <stop offset="100%" stopColor={gradient.end} stopOpacity={0.3} />
            </linearGradient>
          ))}
          
          {/* Neumorphic glow effect */}
          <filter id="neumorphicGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
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
          dataKey="name"
          tick={{ 
            fill: "rgba(255, 255, 255, 0.5)", 
            fontSize: 11,
            fontWeight: 300
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
            fontWeight: 300
          }}
          axisLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
          label={{
            value: "Posts",
            angle: -90,
            position: "insideLeft",
            style: { 
              fill: "rgba(255, 255, 255, 0.4)", 
              fontSize: 11,
              fontWeight: 300
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