"use client";

import { useState, useEffect } from "react";
import { Prospect } from "@/types/brand";
import GlassPills from "./GlassPills";
import HeroMetric from "./ProspectTargetsSwiper";
import SolutionsOpportunities from "./SolutionsOpportunities";

interface OverviewInsightsProps {
  prospects: Prospect[];
  brandId: string;
  isLoading?: boolean;
}

export default function OverviewInsights({
  prospects,
  brandId,
  isLoading = false,
}: OverviewInsightsProps) {
  console.log(JSON.stringify(prospects, null, 2));
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const storageKey = "market-insights-collapsed-total";
    const savedState = localStorage.getItem(storageKey);
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    } else {
      // Default to open for first time users
      setIsCollapsed(false);
    }
  }, []);

  // Save collapsed state to localStorage when it changes
  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    const storageKey = "market-insights-collapsed-total";
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

  // Calculate overview statistics
  const allPosts = prospects.flatMap(
    (prospect) => prospect.sourced_reddit_posts || []
  );
  const totalPosts = allPosts.length;
  // TODO: Update tag logic when tags are implemented in new API
  const tagTotals = {
    potential_customer: 0,
    competitor_mention: 0,
    own_mention: 0,
  };

  // Collect all solutions and opportunities across all use cases
  const allSolutionsAndOpportunities = prospects.flatMap((prospect) => [
    ...(prospect.insights?.identified_solutions || []),
  ]);

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
      {!isCollapsed && prospects && prospects.length > 0 && (
        <div>
          {/* Research Summary - Simplified with Hero Metric */}
          <div className="p-6 space-y-6">
            {/* Hero Metric - Total Potential Customers */}
            <HeroMetric
              value={totalPosts}
              posts={allPosts}
              brandId={brandId}
              label="Total Potential Customers Identified"
              subtext="Click To View"
              onLike={(post) => {
                console.log("Liked post:", post.thing_id, post.title);
                // TODO: Implement actual like functionality
              }}
              onIgnore={(post) => {
                console.log("Ignored post:", post.thing_id, post.title);
                // TODO: Implement actual ignore functionality
              }}
              onStackCompleted={() => {
                console.log("All prospects reviewed!");
                // TODO: Show completion message or refresh data
              }}
            />

            <div className="border-t border-white/10"></div>

            {/* Solutions & Opportunities Section */}
            <SolutionsOpportunities
              items={allSolutionsAndOpportunities}
              title="Key Solutions & Opportunities"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-white/10"></div>

          {/* By Use Case Comparison - Enhanced Table */}
          <div className="p-6">
            <div className="text-white font-heading text-xl font-bold mb-6">
              By Use Case Comparison
            </div>

            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(34, 197, 94, 0.08))",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
                      }}
                    >
                      <th className="text-left p-4 font-heading text-white/80 font-semibold">
                        Use Case
                      </th>
                      <th className="text-center p-4 font-heading text-white/80 font-semibold min-w-[100px]">
                        <div className="flex items-center justify-center gap-2">
                          <svg
                            className="w-4 h-4 text-emerald-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Potential
                        </div>
                      </th>
                      <th className="text-center p-4 font-heading text-white/80 font-semibold min-w-[100px]">
                        <div className="flex items-center justify-center gap-2">
                          <svg
                            className="w-4 h-4 text-rose-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                          Competitors
                        </div>
                      </th>
                      <th className="text-center p-4 font-heading text-white/80 font-semibold min-w-[80px]">
                        Posts
                      </th>
                      <th className="text-left p-4 font-heading text-white/80 font-semibold">
                        Keywords
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {prospects.map((prospect, index) => {
                      const ucPosts = prospect.sourced_reddit_posts || [];
                      // TODO: Update tag logic when tags are implemented in new API
                      const ucTotals = {
                        potential_customer: 0,
                        competitor_mention: 0,
                      };

                      return (
                        <tr
                          key={prospect.id}
                          className="group transition-all duration-200 hover:bg-white/[0.02]"
                          style={{
                            borderBottom:
                              index < prospects.length - 1
                                ? "1px solid rgba(255, 255, 255, 0.08)"
                                : "none",
                          }}
                        >
                          <td className="p-4">
                            <div className="text-white font-heading font-medium text-base">
                              {prospect.problem_to_solve}
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            <div
                              className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg"
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))",
                                border: "1px solid rgba(34, 197, 94, 0.2)",
                              }}
                            >
                              <span className="text-emerald-300 font-heading font-bold text-xl">
                                {ucTotals.potential_customer}
                              </span>
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            <div
                              className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg"
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(239, 68, 68, 0.15))",
                                border: "1px solid rgba(244, 63, 94, 0.2)",
                              }}
                            >
                              <span className="text-rose-300 font-heading font-bold text-xl">
                                {ucTotals.competitor_mention}
                              </span>
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            <span className="text-white/70 font-body text-sm">
                              {ucPosts.length}
                            </span>
                          </td>

                          <td className="p-4">
                            <GlassPills
                              items={(prospect.keywords || []).map((kw) => ({
                                label: kw,
                              }))}
                              variant="keywords"
                              size="sm"
                              maxVisible={4}
                              emptyText="No keywords"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
