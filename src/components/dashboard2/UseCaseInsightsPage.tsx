"use client";

import { useState, useEffect } from "react";
import { Prospect } from "@/types/brand";
import UseCaseInsightsComponent from "./UseCaseInsights";
// import CompetitorSummary from "./CompetitorSummary"; // TODO: Re-enable when API supports it
import GlassPills from "./GlassPills";
import HeroMetric, { ProspectFunnelData } from "./ProspectTargetsStat";
// import { getTopKeywordCounts } from "@/lib/keyword-utils"; // TODO: Update for new RedditPost structure

interface UseCaseInsightsProps {
  selectedUseCase: Prospect;
  brandId: string;
  brandName?: string;
  brandDetail?: string;
  isLoading?: boolean;
  prospectFunnelData?: ProspectFunnelData;
}

export default function UseCaseInsightsPage({
  selectedUseCase,
  brandId,
  brandName,
  brandDetail,
  isLoading = false,
  prospectFunnelData,
}: UseCaseInsightsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const storageKey = `market-insights-collapsed-${selectedUseCase.problem_to_solve}`;
    const savedState = localStorage.getItem(storageKey);
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    } else {
      // Default to open for first time users
      setIsCollapsed(false);
    }
  }, [selectedUseCase.problem_to_solve]);

  // Save collapsed state to localStorage when it changes
  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    const storageKey = `market-insights-collapsed-${selectedUseCase.problem_to_solve}`;
    localStorage.setItem(storageKey, JSON.stringify(newState));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-white">
          <svg
            className="w-5 h-5 animate-spin text-white/80"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <span className="font-body">Researching your topic...</span>
        </div>
      </div>
    );
  }

  // Calculate use case specific statistics
  const uc = selectedUseCase;
  const ucPosts = uc.sourced_reddit_posts || [];
  // TODO: Update tag logic when tags are implemented in new API
  const ucTotals = {
    potential_customer: 0,
    competitor_mention: 0,
    own_mention: 0,
  };

  const ucSubCounts = ucPosts.reduce<Record<string, number>>((acc, post) => {
    acc[post.subreddit] = (acc[post.subreddit] || 0) + 1;
    return acc;
  }, {});

  const ucTopSubs = Object.entries(ucSubCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Header with Collapse Toggle */}
      <div
        className="p-5 cursor-pointer transition-all duration-300 hover:bg-white/5 border-b border-white/10"
        onClick={handleToggleCollapse}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(34, 197, 94, 0.3))",
              }}
            >
              <svg
                className="w-5 h-5 text-purple-300"
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
            <h2 className="text-white font-heading text-xl font-bold">
              Problem Validation Research
            </h2>
          </div>
          <svg
            className={`w-5 h-5 text-white/70 transition-transform duration-200 ${
              isCollapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div>
          {/* Activity Overview for Selected Use Case - Enhanced */}
          <div className="p-6 space-y-6">
            {/* Hero Metric - Potential Customers Only */}
            <HeroMetric
              funnelData={prospectFunnelData || {
                total: ucPosts.filter(p => p.status !== 'IGNORE').length,
                pending: {
                  count: ucPosts.filter(p => p.status === 'PENDING').length,
                  posts: ucPosts.filter(p => p.status === 'PENDING')
                },
                reply: {
                  count: ucPosts.filter(p => p.status === 'REPLY' || p.status === 'SUGGESTED_REPLY').length,
                  posts: ucPosts.filter(p => p.status === 'REPLY' || p.status === 'SUGGESTED_REPLY')
                }
              }}
              brandId={brandId}
              brandName={brandName}
              brandDetail={brandDetail}
              prospectId={selectedUseCase.id}
              problemToSolve={selectedUseCase.problem_to_solve}
              onStackCompleted={() => {
                console.log("All prospects for this use case reviewed!");
                // TODO: Show completion message or refresh data
              }}
            />

            {/* Enhanced Keywords and Subreddits - Using Standardized Component */}
            <div className="space-y-6">
              {/* Keywords Section */}
              <div>
                <h4 className="text-white/90 font-heading text-lg font-semibold mb-4 flex items-center gap-2">
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
                  Trending Keywords
                </h4>
                <GlassPills
                  items={(uc.keywords || []).map((kw) => ({
                    label: kw,
                    count: 1, // TODO: Implement keyword counting for new RedditPost structure
                  }))}
                  variant="keywords"
                  size="lg"
                  maxVisible={8}
                  emptyText="No keywords tracked"
                />
              </div>

              {/* Subreddits Section */}
              <div>
                <h4 className="text-white/90 font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  Active Subreddits
                </h4>
                <GlassPills
                  items={ucTopSubs.map(([name, count]) => ({
                    label: name as string,
                    count: count as number,
                  }))}
                  variant="subreddits"
                  size="lg"
                  maxVisible={8}
                  prefix="r/"
                  emptyText="No subreddit data"
                />
              </div>
            </div>
          </div>

          {/* Insights View */}
          {selectedUseCase.insights && (
            <UseCaseInsightsComponent insights={selectedUseCase.insights} />
          )}

          {/* TODO: Competitor Summary - Waiting for new API structure */}
          {/* {selectedUseCase.competitor_summary && (
            <CompetitorSummary
              summary={selectedUseCase.competitor_summary}
              hotFeatures={selectedUseCase.hot_features_summary}
            />
          )} */}
        </div>
      )}
    </div>
  );
}
