"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Prospect } from "@/types/brand";
import GlassPanel from "@/components/ui/GlassPanel";
import LiquidGlassCard from "./charts/LiquidGlassCard";
import StackedPostsChart from "./charts/StackedPostsChart";
import MultiLineChart from "./charts/MultiLineChart";
import {
  transformStackedBarData,
  transformTimeSeriesData,
  calculateEngagementMetrics,
} from "@/utils/chartDataTransformations";

interface VizSummaryViewProps {
  prospects: Prospect[];
  brandId: string;
}

export default function VizSummaryView({
  prospects,
  brandId,
}: VizSummaryViewProps) {
  // Aggregate data for visualizations
  const aggregatedData = useMemo(() => {
    // Aggregate posts by subreddit across all prospects
    const subredditCounts: Record<string, number> = {};
    const prospectPostCounts: Record<string, number> = {};
    const keywordCounts: Record<string, number> = {};
    let totalPosts = 0;
    let totalKeywords = 0;

    prospects.forEach((prospect) => {
      // Count posts per prospect
      const postCount = prospect.sourced_reddit_posts?.length || 0;
      prospectPostCounts[prospect.problem_to_solve] = postCount;
      totalPosts += postCount;

      // Count posts by subreddit
      prospect.sourced_reddit_posts?.forEach((post) => {
        subredditCounts[post.subreddit] =
          (subredditCounts[post.subreddit] || 0) + 1;
      });

      // Count keywords
      prospect.keywords?.forEach((keyword) => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        totalKeywords++;
      });
    });

    // Sort and get top items
    const topSubreddits = Object.entries(subredditCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const topKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    return {
      totalPosts,
      totalKeywords,
      totalProspects: prospects.length,
      topSubreddits,
      topKeywords,
      prospectPostCounts,
    };
  }, [prospects]);

  // Calculate bar heights for visualization
  const maxSubredditCount = Math.max(
    ...aggregatedData.topSubreddits.map(([_, count]) => count)
  );
  const maxKeywordCount = Math.max(
    ...aggregatedData.topKeywords.map(([_, count]) => count)
  );

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div>
        <h2 className="text-white font-heading text-2xl font-bold mb-2 tracking-tight">
          Brand Analytics Overview
        </h2>
        <p className="text-white/80 font-body text-base leading-relaxed">
          Visual insights aggregated from {aggregatedData.totalPosts} posts
          across {aggregatedData.totalProspects} prospects
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <GlassPanel className="p-4 rounded-lg" variant="medium">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <svg
                className="w-5 h-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white/50 font-body text-xs">Total Prospects</p>
              <p className="text-white font-heading text-2xl font-bold">
                {aggregatedData.totalProspects}
              </p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 rounded-lg" variant="medium">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <svg
                className="w-5 h-5 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white/50 font-body text-xs">Total Posts</p>
              <p className="text-white font-heading text-2xl font-bold">
                {aggregatedData.totalPosts}
              </p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 rounded-lg" variant="medium">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                />
              </svg>
            </div>
            <div>
              <p className="text-white/50 font-body text-xs">Total Keywords</p>
              <p className="text-white font-heading text-2xl font-bold">
                {aggregatedData.totalKeywords}
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      {/* Charts Row - Side by side on md+ screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Subreddits Chart */}
        <div>
          <h3 className="text-white font-heading text-lg font-semibold mb-4">
            Top Subreddits by Post Count
          </h3>
          <div className="space-y-3">
            {aggregatedData.topSubreddits.map(([subreddit, count]) => (
              <div key={subreddit} className="flex items-center gap-3">
                <div className="w-32 text-white/70 font-body text-sm truncate">
                  r/{subreddit}
                </div>
                <div className="flex-1 bg-white/5 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxSubredditCount) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-white/90 font-body text-xs font-medium">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Posts by Prospect */}
        <div>
          <h3 className="text-white font-heading text-lg font-semibold mb-4">
            Posts Distribution by Prospect
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(aggregatedData.prospectPostCounts).map(
              ([prospect, count]) => (
                <GlassPanel
                  key={prospect}
                  className="p-3 rounded-lg"
                  variant="medium"
                >
                  <p className="text-white/70 font-body text-sm mb-1 truncate">
                    {prospect}
                  </p>
                  <p className="text-white font-heading text-xl font-bold">
                    {count} posts
                  </p>
                  <div className="mt-2 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(count / aggregatedData.totalPosts) * 100}%`,
                      }}
                    />
                  </div>
                </GlassPanel>
              )
            )}
          </div>
        </div>
      </div>

      {/* Top Keywords */}
      <div>
        <h3 className="text-white font-heading text-lg font-semibold mb-4">
          Posts By Source Keywords
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {aggregatedData.topKeywords.map(([keyword, count]) => (
            <span
              key={keyword}
              className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 font-body text-xs"
              style={{
                opacity: 0.5 + (count / maxKeywordCount) * 0.5,
              }}
            >
              {keyword} ({count})
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      {/* Charts Grid - Side by side on md+ screens, stacked on smaller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stacked Bar Chart - Posts by Status */}
        <div>
          <LiquidGlassCard
            title="Post Status Distribution Across Prospects"
            subtitle={`Comparing ${prospects.length} prospects with ${aggregatedData.totalPosts} total posts`}
            glowColor="rgba(59, 130, 246, 0.4)"
          >
            <StackedPostsChart data={transformStackedBarData(prospects)} />
          </LiquidGlassCard>
        </div>

        {/* Multi-Line Chart - Engagement Over Time */}
        <div>
          {prospects.length > 0 && prospects.some(p => p.sourced_reddit_posts?.length > 0) ? (
            <LiquidGlassCard
              title="Engagement Trends Over Time"
              subtitle="Score patterns across all prospects"
              glowColor="rgba(139, 92, 246, 0.4)"
            >
              <MultiLineChart
                data={transformTimeSeriesData(prospects)}
                lines={prospects.slice(0, 5).map(p => `${p.problem_to_solve.substring(0, 20)}...`)}
              />
            </LiquidGlassCard>
          ) : (
            <div className="h-full" />
          )}
        </div>
      </div>

      {/* NEW: Engagement Metrics Comparison */}
      <div>
        <h3 className="text-white font-heading text-lg font-semibold mb-4">
          Engagement Metrics by Prospect
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {calculateEngagementMetrics(prospects).slice(0, 6).map((metrics, index) => (
            <motion.div
              key={metrics.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative rounded-lg p-4"
              style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <p className="text-white/80 font-body text-sm mb-3 truncate">
                {metrics.name}
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-white/50 text-xs">Avg Score</p>
                  <p className="text-white font-bold text-lg">{metrics.avgScore}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs">Total Posts</p>
                  <p className="text-white font-bold text-lg">{metrics.totalPosts}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs">Engagement</p>
                  <p className="text-white font-bold text-lg">{metrics.engagementRate}x</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
