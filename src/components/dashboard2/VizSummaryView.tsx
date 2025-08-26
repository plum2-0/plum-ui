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

interface VizSummaryViewProps {
  prospects: Prospect[];
}

function FilterToggle({
  value,
  onChange,
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
        boxShadow:
          "inset 0 2px 10px rgba(0, 0, 0, 0.2), inset 0 -1px 5px rgba(255, 255, 255, 0.05)",
      }}
    >
      <div className="flex gap-1">
        <button
          onClick={() => onChange("all")}
          className="relative px-5 py-2 rounded-xl text-xs font-medium transition-all duration-300"
          style={{
            background:
              value === "all"
                ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)"
                : "transparent",
            color:
              value === "all"
                ? "rgba(255, 255, 255, 0.9)"
                : "rgba(255, 255, 255, 0.5)",
            boxShadow:
              value === "all"
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
            background:
              value === "accepted"
                ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)"
                : "transparent",
            color:
              value === "accepted"
                ? "rgba(255, 255, 255, 0.9)"
                : "rgba(255, 255, 255, 0.5)",
            boxShadow:
              value === "accepted"
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

export default function VizSummaryView({ prospects }: VizSummaryViewProps) {
  const [filter, setFilter] = useState<"all" | "accepted">("all");

  // Filter posts in each prospect based on selection
  const filteredProspects = useMemo(() => {
    return (prospects || []).map((prospect) => ({
      ...prospect,
      sourced_reddit_posts:
        prospect.sourced_reddit_posts?.filter((post) =>
          filter === "all"
            ? post.status === "ACTIONED" || post.status === "PENDING"
            : post.status === "ACTIONED"
        ) || [],
    }));
  }, [prospects, filter]);

  // Aggregate all filtered posts into a single synthetic prospect
  const aggregatedProspect = useMemo(() => {
    const allPosts = filteredProspects.flatMap(
      (p) => p.sourced_reddit_posts || []
    );

    const synthetic = {
      problem_to_solve: "All Prospects",
      sourced_reddit_posts: allPosts,
    } as Prospect;

    return synthetic;
  }, [filteredProspects]);

  // Transform data using the same structure as VizProspectView
  const chartData = useMemo(() => {
    const stackedData = transformStackedBarDataByKeywords(aggregatedProspect);
    const timeSeriesData = transformPostsOverTimeData([aggregatedProspect]);
    const engagementMetrics = calculateEngagementMetrics([
      aggregatedProspect,
    ])[0] || {
      name: "All Prospects",
      totalPosts: 0,
      totalScore: 0,
      totalUpvotes: 0,
      totalReplies: 0,
      avgScore: 0,
      avgReplies: 0,
      engagementRate: 0,
    };

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
  }, [aggregatedProspect]);

  return (
    <div className="space-y-6">
      {/* Filter Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="icon-badge">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"
              />
            </svg>
          </span>
          <span className="eyebrow">Brand Data Visualization</span>
        </div>
        <FilterToggle value={filter} onChange={setFilter} />
      </div>
      <div className="content-divider my-6" />

      {/* Header with metrics */}

      {/* Posts by Source Keywords */}
      <LiquidGlassCard
        title="Posts by Source Keywords"
        subtitle={`Distribution of ${chartData.engagementMetrics.totalPosts} posts by keyword source`}
        glowColor="rgba(59, 130, 246, 0.4)"
      >
        <StackedPostsChart data={chartData.stackedData} />
      </LiquidGlassCard>

      {/* Posts Over Time */}
      {chartData.timeSeriesData.length > 0 ? (
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
      ) : null}

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
                ? "No accepted posts found across prospects."
                : "No posts found yet. Data will appear here once posts are sourced."}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
