"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Prospect, RedditPost } from "@/types/brand";
import LiquidGlassCard from "./charts/LiquidGlassCard";
import StackedPostsChart from "./charts/StackedPostsChart";
import KeywordPostsModal from "./KeywordPostsModal";
import BrandFunnelChart from "./charts/BrandFunnelChart";
import {
  transformStackedBarDataByKeywords,
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
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<RedditPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const chartData = useMemo(() => {
    const stackedData = transformStackedBarDataByKeywords(aggregatedProspect);
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

    return {
      stackedData,
      engagementMetrics,
    };
  }, [aggregatedProspect]);

  // Handle keyword selection for modal
  const handleKeywordClick = (keyword: string) => {
    const keywordData = chartData.stackedData.find(
      (item) => item.fullName === keyword
    );
    if (keywordData?.posts) {
      setSelectedKeyword(keyword);
      setSelectedPosts(keywordData.posts);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedKeyword(null);
    setSelectedPosts([]);
  };
  // Aggregate brand-level funnel metrics across prospects
  const { funnelData, totals } = useMemo(() => {
    const totals = filteredProspects.reduce(
      (acc, p) => {
        const postsScraped = Number(p.total_posts_scraped ?? 0);
        const leadsDiscovered = Number(
        
            (p as any).total_leads_tagged ??
            (() => {
              const pendingAuthors = new Set(
                (p.sourced_reddit_posts ?? [])
                  .map((post) => post.author)
                  .filter((a) => a != null)
              );
              return pendingAuthors.size;
            })()
        );
        const leadsEngaged = Number(
          (p as any).total_leads_engaged ??
            (p as any).total_posts_engaged ??
            p.sourced_reddit_posts?.filter((post) => post.status === "ACTIONED")
              .length ??
            0
        );
        const leadsConverted = Number((p as any).total_leads_converted ?? 0);
        const leadsDropped = Number((p as any).total_leads_dropped ?? 0);

        acc.total_posts_scraped += postsScraped;
        acc.total_leads_discovered += leadsDiscovered;
        acc.total_leads_engaged += leadsEngaged;
        acc.total_leads_converted += leadsConverted;
        acc.total_leads_dropped += leadsDropped;
        return acc;
      },
      {
        total_posts_scraped: 0,
        total_leads_discovered: 0,
        total_leads_engaged: 0,
        total_leads_converted: 0,
        total_leads_dropped: 0,
      }
    );

    const discoveredBase = totals.total_leads_discovered || 0;
    const engagedBase = totals.total_leads_engaged || 0;
    const funnelData = [
      {
        name: "Total Leads Discovered",
        value: totals.total_leads_discovered,
        prev: discoveredBase,
      },
      {
        name: "Total Leads Engaged",
        value: totals.total_leads_engaged,
        prev: discoveredBase,
      },
      {
        name: "Total Leads Converted",
        value: totals.total_leads_converted,
        prev: engagedBase,
        color: "#34D399",
      },
      // Dropped intentionally omitted from the chart view
    ];

    return { funnelData, totals };
  }, [filteredProspects]);

  // PMF status based solely on Total Leads Engaged % of Discovered
  const pmf = useMemo(() => {
    const base = totals.total_leads_discovered || 0;
    const engaged = totals.total_leads_engaged || 0;
    const engagedPct = base > 0 ? (engaged / base) * 100 : 0;

    const status = engagedPct > 20 ? "GOOD" : engagedPct >= 10 ? "AVG" : "BAD";
    return { status, engagedPct };
  }, [totals]);

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
        title="Top 10 Keywords"
        subtitle={`Distribution of ${chartData.engagementMetrics.totalPosts} posts by keyword source`}
        glowColor="rgba(59, 130, 246, 0.4)"
      >
        <StackedPostsChart
          data={chartData.stackedData}
          onBarClick={handleKeywordClick}
          onViewPosts={handleKeywordClick}
        />
      </LiquidGlassCard>

      {/* Brand > Prospect Funnel */}
      <LiquidGlassCard
        title="Leads Funnel"
        subtitle="From discovered leads to engaged and converted leads"
        glowColor="rgba(34, 211, 238, 0.35)"
      >
        {/* PMF Status Row (Engaged % only) */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background:
                  pmf.status === "GOOD"
                    ? "rgba(16, 185, 129, 0.15)"
                    : pmf.status === "BAD"
                    ? "rgba(239, 68, 68, 0.15)"
                    : "rgba(234, 179, 8, 0.15)",
                color:
                  pmf.status === "GOOD"
                    ? "#34D399"
                    : pmf.status === "BAD"
                    ? "#F87171"
                    : "#FBBF24",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              PMF: {pmf.status} · {pmf.engagedPct.toFixed(1)}%
            </span>
            <span className="text-white/60 text-xs">
              Based on Total Leads Engaged %
            </span>
          </div>
        </div>

        <BrandFunnelChart data={funnelData} />
      </LiquidGlassCard>

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

      {/* Keyword Posts Modal */}
      {selectedKeyword && (
        <KeywordPostsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          keyword={selectedKeyword}
          posts={selectedPosts}
        />
      )}
    </div>
  );
}
