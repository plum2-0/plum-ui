"use client";

import { useState, useEffect } from "react";
import { UseCase } from "@/types/brand";
import SummaryMetrics from "./SummaryMetrics";
import SummaryStatsCard from "./SummaryStatsCard";
import UseCaseInsightsComponent from "./UseCaseInsights";
import CompetitorSummary from "./CompetitorSummary";
import { getTopKeywordCounts } from "@/lib/keyword-utils";

interface MarketInsightsSectionProps {
  selectedUseCase: UseCase | null;
  useCases: UseCase[];
  isLoading?: boolean;
}

export default function MarketInsightsSection({
  selectedUseCase,
  useCases,
  isLoading = false,
}: MarketInsightsSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const storageKey = selectedUseCase
      ? `market-insights-collapsed-${selectedUseCase.title}`
      : "market-insights-collapsed-total";

    const savedState = localStorage.getItem(storageKey);
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    } else {
      // Default to open for first time users
      setIsCollapsed(false);
    }
  }, [selectedUseCase?.title]);

  // Save collapsed state to localStorage when it changes
  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);

    const storageKey = selectedUseCase
      ? `market-insights-collapsed-${selectedUseCase.title}`
      : "market-insights-collapsed-total";

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
          {/* Total view: Overall Posts Summary across all use cases */}
          {!selectedUseCase &&
            useCases &&
            useCases.length > 0 &&
            (() => {
              const allPosts = useCases.flatMap(
                (uc) => uc.subreddit_posts || []
              );
              const totalPosts = allPosts.length;
              const tagTotals = allPosts.reduce(
                (acc, post) => {
                  if (post.tags?.potential_customer)
                    acc.potential_customer += 1;
                  if (post.tags?.competitor_mention)
                    acc.competitor_mention += 1;
                  if (post.tags?.own_mention) acc.own_mention += 1;
                  return acc;
                },
                {
                  potential_customer: 0,
                  competitor_mention: 0,
                  own_mention: 0,
                }
              );
              const subredditCounts = allPosts.reduce<Record<string, number>>(
                (acc, post) => {
                  acc[post.subreddit] = (acc[post.subreddit] || 0) + 1;
                  return acc;
                },
                {}
              );
              const topSubreddits = Object.entries(subredditCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6);

              const allKeywords = Array.from(
                new Set(
                  useCases
                    .flatMap((uc) => uc.keywords || [])
                    .map((k) => k.trim())
                    .filter(Boolean)
                )
              );
              const topKeywords = getTopKeywordCounts(allPosts, allKeywords, 8);

              return (
                <>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.3))",
                        }}
                      >
                        <svg
                          className="w-5 h-5 text-emerald-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 7h18M3 12h18M3 17h18"
                          />
                        </svg>
                      </div>
                      <h2 className="text-white font-heading text-xl font-bold">
                        Problem Validation Research Summary
                      </h2>
                    </div>

                    <SummaryMetrics
                      totalPosts={totalPosts}
                      potentialCustomers={tagTotals.potential_customer}
                      competitorMentions={tagTotals.competitor_mention}
                      ownMentions={tagTotals.own_mention}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <SummaryStatsCard
                        title="Top Keywords"
                        items={topKeywords.map(([kw, count]) => ({
                          label: kw as string,
                          count: count as number,
                        }))}
                        emptyText="No keywords yet"
                      />
                      <SummaryStatsCard
                        title="Top Subreddits"
                        items={topSubreddits.map(([name, count]) => ({
                          label: name as string,
                          count: count as number,
                        }))}
                        prefix="r/"
                        emptyText="No subreddit data yet"
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10"></div>

                  {/* Summary Table */}
                  <div className="p-6">
                    <div className="text-white font-heading text-lg font-bold mb-4">
                      By Use Case
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left text-white/70">
                            <th className="py-2 pr-4 font-body">Use Case</th>
                            <th className="py-2 pr-4 font-body">Potential</th>
                            <th className="py-2 pr-4 font-body">Competitor</th>
                            <th className="py-2 pr-4 font-body">Keywords</th>
                          </tr>
                        </thead>
                        <tbody>
                          {useCases.map((uc) => {
                            const ucPosts = uc.subreddit_posts || [];
                            const ucTotals = ucPosts.reduce(
                              (acc, post) => {
                                if (post.tags?.potential_customer)
                                  acc.potential_customer += 1;
                                if (post.tags?.competitor_mention)
                                  acc.competitor_mention += 1;
                                return acc;
                              },
                              { potential_customer: 0, competitor_mention: 0 }
                            );
                            return (
                              <tr
                                key={uc.id}
                                className="border-t border-white/10"
                              >
                                <td className="py-3 pr-4 text-white font-body">
                                  {uc.title}
                                </td>
                                <td className="py-3 pr-4 text-emerald-300 font-heading">
                                  {ucTotals.potential_customer}
                                </td>
                                <td className="py-3 pr-4 text-rose-300 font-heading">
                                  {ucTotals.competitor_mention}
                                </td>
                                <td className="py-3 pr-4">
                                  <div className="flex flex-wrap gap-1">
                                    {(uc.keywords || []).length ? (
                                      (uc.keywords || [])
                                        .slice(0, 8)
                                        .map((kw) => (
                                          <span
                                            key={kw}
                                            className="px-2 py-0.5 rounded-full text-xs font-body text-white/90"
                                            style={{
                                              background:
                                                "rgba(255, 255, 255, 0.08)",
                                              border:
                                                "1px solid rgba(255, 255, 255, 0.15)",
                                            }}
                                          >
                                            {kw}
                                          </span>
                                        ))
                                    ) : (
                                      <span className="text-white/60 text-xs font-body">
                                        —
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              );
            })()}

          {/* Selected Use Case: Activity for the chosen use case only */}
          {selectedUseCase &&
            (() => {
              const uc = selectedUseCase;
              const ucPosts = uc.subreddit_posts || [];
              const ucTotals = ucPosts.reduce(
                (acc, post) => {
                  if (post.tags?.potential_customer)
                    acc.potential_customer += 1;
                  if (post.tags?.competitor_mention)
                    acc.competitor_mention += 1;
                  if (post.tags?.own_mention) acc.own_mention += 1;
                  return acc;
                },
                {
                  potential_customer: 0,
                  competitor_mention: 0,
                  own_mention: 0,
                }
              );
              const ucSubCounts = ucPosts.reduce<Record<string, number>>(
                (acc, post) => {
                  acc[post.subreddit] = (acc[post.subreddit] || 0) + 1;
                  return acc;
                },
                {}
              );
              const ucTopSubs = Object.entries(ucSubCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
              return (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-heading text-lg font-bold">
                      Activity Overview
                    </h3>
                  </div>

                  <div className="mb-4">
                    <SummaryMetrics
                      totalPosts={ucPosts.length}
                      potentialCustomers={ucTotals.potential_customer}
                      competitorMentions={ucTotals.competitor_mention}
                      ownMentions={ucTotals.own_mention}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <SummaryStatsCard
                      title="Keywords"
                      size="sm"
                      items={getTopKeywordCounts(
                        ucPosts,
                        uc.keywords || [],
                        12
                      ).map(([kw, count]) => ({
                        label: kw as string,
                        count: count as number,
                      }))}
                      emptyText="No keywords"
                    />
                    <SummaryStatsCard
                      title="Top Subreddits"
                      size="sm"
                      items={ucTopSubs.map(([name, count]) => ({
                        label: name as string,
                        count: count as number,
                      }))}
                      prefix="r/"
                      emptyText="No subreddit data"
                    />
                  </div>
                </div>
              );
            })()}

          {/* Insights and Competitor sections remain separate for specific use cases */}
          {selectedUseCase && (
            <>
              {/* Insights View */}
              {selectedUseCase.insights && (
                <UseCaseInsightsComponent
                  insights={selectedUseCase.insights}
                  insightTitle={selectedUseCase.title}
                />
              )}

              {/* Competitor Summary */}
              {selectedUseCase.competitor_summary && (
                <CompetitorSummary
                  summary={selectedUseCase.competitor_summary}
                  hotFeatures={selectedUseCase.hot_features_summary}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
