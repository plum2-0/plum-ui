"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Prospect } from "@/types/brand";
import LiquidGlassCard from "./charts/LiquidGlassCard";
import StackedPostsChart from "./charts/StackedPostsChart";
import MultiLineChart from "./charts/MultiLineChart";
import {
  transformStackedBarDataByKeywords,
  transformPostsOverTimeData,
  calculateEngagementMetrics,
} from "@/utils/chartDataTransformations";

interface VizProspectViewProps {
  prospect: Prospect;
}

// Filter toggle component with neumorphic styling
function FilterToggle({ 
  value, 
  onChange 
}: { 
  value: "all" | "accepted";
  onChange: (value: "all" | "accepted") => void;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative p-1 rounded-2xl" 
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.2), inset 0 -1px 5px rgba(255, 255, 255, 0.05)",
      }}
    >
      <div className="flex gap-1">
        <button
          onClick={() => onChange("all")}
          className="relative px-5 py-2 rounded-xl text-xs font-medium transition-all duration-300"
          style={{
            background: value === "all" 
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)"
              : "transparent",
            color: value === "all" ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.5)",
            boxShadow: value === "all" 
              ? "0 4px 15px rgba(139, 92, 246, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1)"
              : "none",
          }}
        >
          All Posts
        </button>
        <button
          onClick={() => onChange("accepted")}
          className="relative px-5 py-2 rounded-xl text-xs font-medium transition-all duration-300"
          style={{
            background: value === "accepted" 
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)"
              : "transparent",
            color: value === "accepted" ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.5)",
            boxShadow: value === "accepted" 
              ? "0 4px 15px rgba(139, 92, 246, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1)"
              : "none",
          }}
        >
          Accepted Only
        </button>
      </div>
    </motion.div>
  );
}

export default function VizProspectView({ prospect }: VizProspectViewProps) {
  const [filter, setFilter] = useState<"all" | "accepted">("all");
  // Filter posts based on selection
  const filteredProspect = useMemo(() => {
    if (filter === "all") {
      return {
        ...prospect,
        sourced_reddit_posts: prospect.sourced_reddit_posts?.filter(
          post => post.status === "ACTIONED" || post.status === "PENDING"
        ) || []
      };
    } else {
      return {
        ...prospect,
        sourced_reddit_posts: prospect.sourced_reddit_posts?.filter(
          post => post.status === "ACTIONED"
        ) || []
      };
    }
  }, [prospect, filter]);

  // Transform data for charts
  const chartData = useMemo(() => {
    const stackedData = transformStackedBarDataByKeywords(filteredProspect);
    const timeSeriesData = transformPostsOverTimeData([filteredProspect]);
    const engagementMetrics = calculateEngagementMetrics([filteredProspect])[0];

    // Get the keys for the line chart (excluding date fields)
    const lineKeys =
      timeSeriesData.length > 0
        ? Object.keys(timeSeriesData[0]).filter(
            (k) => k !== "date" && k !== "fullDate"
          )
        : [];

    return {
      stackedData,
      timeSeriesData,
      engagementMetrics,
      lineKeys,
    };
  }, [filteredProspect]);

  return (
    <div className="space-y-6">
      {/* Filter Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-heading font-bold text-white/90">
          Data Visualization
        </h2>
        <FilterToggle value={filter} onChange={setFilter} />
      </div>

      {/* Header with metrics */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-4 gap-4"
      >
        {[
          { 
            label: filter === "all" ? "Total Posts" : "Accepted Posts", 
            value: chartData.engagementMetrics.totalPosts, 
            color: "#8B5CF6" 
          },
          {
            label: "Avg Score",
            value: chartData.engagementMetrics.avgScore,
            color: "#3B82F6",
          },
          {
            label: "Total Upvotes",
            value: chartData.engagementMetrics.totalUpvotes,
            color: "#10B981",
          },
          {
            label: "Engagement Rate",
            value: `${chartData.engagementMetrics.engagementRate}x`,
            color: "#F59E0B",
          },
        ].map((metric, index) => (
          <motion.div
            key={`${metric.label}-${filter}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative rounded-lg p-4"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs font-body mb-1">
                  {metric.label}
                </p>
                <p className="text-2xl font-heading font-bold text-white">
                  {metric.value}
                </p>
              </div>
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: metric.color,
                  boxShadow: `0 0 12px ${metric.color}80`,
                }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Posts by Source Keywords */}
      <LiquidGlassCard
        title="Posts by Source Keywords"
        subtitle={`Distribution of ${chartData.engagementMetrics.totalPosts} posts by keyword source`}
        glowColor="rgba(59, 130, 246, 0.4)"
      >
        <StackedPostsChart data={chartData.stackedData} />
      </LiquidGlassCard>

      {/* Posts Over Time */}
      {chartData.timeSeriesData.length > 0 && (
        <LiquidGlassCard
          title="Posts Over Time"
          subtitle="Daily post count trends"
          glowColor="rgba(139, 92, 246, 0.4)"
        >
          <MultiLineChart
            data={chartData.timeSeriesData}
            lines={chartData.lineKeys}
          />
        </LiquidGlassCard>
      )}

      {/* No data state */}
      {chartData.engagementMetrics.totalPosts === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-[40vh] flex flex-col items-center justify-center"
        >
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-heading font-bold text-white/80 mb-2">
              No {filter === "accepted" ? "Accepted" : ""} Data Available
            </h3>
            <p className="text-white/50 font-body max-w-md mx-auto">
              {filter === "accepted" 
                ? "No accepted posts found for this prospect."
                : "No posts found for this prospect. Data will appear here once posts are sourced."}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
