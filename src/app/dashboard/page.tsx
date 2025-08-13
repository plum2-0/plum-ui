"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Brand, UseCase } from "@/types/brand";
import DashboardSidebar from "@/components/dashboard2/DashboardSidebar";
import CompetitorSummary from "@/components/dashboard2/CompetitorSummary";
import UseCaseInsightsComponent from "@/components/dashboard2/UseCaseInsights";
import SummaryMetrics from "@/components/dashboard2/SummaryMetrics";
import SummaryStatsCard from "@/components/dashboard2/SummaryStatsCard";
import { getTopKeywordCounts } from "@/lib/keyword-utils";
import { useBrandQuery, useGenerateUseCaseInsight } from "@/hooks/api/useBrandQuery";

export default function Dashboard2Page() {
  const { data: session } = useSession();
  const { data: brandResponse, isLoading, error, refetch } = useBrandQuery();
  const generateInsight = useGenerateUseCaseInsight();
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [loadingUseCaseId, setLoadingUseCaseId] = useState<string | null>(null);
  
  const brandData = brandResponse?.brand || null;

  // No posts filters needed when showing insights-only view

  // Set initial selected use case when brand data loads
  useState(() => {
    if (brandData && !selectedUseCase) {
      // Default to Total (no specific use case selected)
      setSelectedUseCase(null);
    }
  });

  const handleAddUseCase = async (title: string) => {
    if (!brandData) return Promise.resolve();

    const brandId = brandData.id;
    const tempId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());

    const tempUseCase: UseCase = {
      id: tempId,
      title,
      description: "",
      hot_features_summary: null,
      competitor_summary: null,
      created_at: new Date().toISOString(),
      brand_id: brandId,
      subreddit_posts: [],
      // insights intentionally undefined while loading
    } as unknown as UseCase;

    // Optimistically select the temp use case
    setSelectedUseCase(tempUseCase);
    setLoadingUseCaseId(tempId);

    try {
      // Generate insight and let React Query handle the refetch
      await generateInsight.mutateAsync({ brandId, title });
      
      // After successful generation, find and select the new use case
      const updatedBrand = await refetch();
      if (updatedBrand.data?.brand) {
        const created = updatedBrand.data.brand.target_use_cases.find(
          (uc) => uc.title.trim().toLowerCase() === title.trim().toLowerCase()
        );
        if (created) {
          setSelectedUseCase(created);
        }
      }
    } catch (e) {
      console.error(e);
      // On failure, reset selection
      setSelectedUseCase(() => {
        const first = brandData?.target_use_cases[0];
        return first ?? null;
      });
    } finally {
      setLoadingUseCaseId(null);
    }

    return Promise.resolve();
  };

  console.log(JSON.stringify(brandData, null, 2));

  // No tab state to manage in insights-only view

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-white text-xl font-body">
          Loading brand data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-300 text-xl font-body">Error: {error.message}</div>
      </div>
    );
  }

  if (!brandData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl font-body">No brand data found</div>
      </div>
    );
  }

  // Posts list and filters removed for insights-only view

  const isSelectedUseCaseLoading =
    selectedUseCase && loadingUseCaseId === selectedUseCase.id;

  return (
    <div className="h-full flex overflow-hidden">
      {/* Fixed Sidebar with existing styling */}
      <div className="w-64 shrink-0">
        <DashboardSidebar
          useCases={brandData.target_use_cases}
          selectedUseCase={selectedUseCase}
          onUseCaseSelect={setSelectedUseCase}
          onlyUnread={onlyUnread}
          setOnlyUnread={setOnlyUnread}
          onAddUseCase={handleAddUseCase}
        />
      </div>

      {/* Scrollable Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {isSelectedUseCaseLoading ? (
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
            ) : (
              <>
                {/* Total tab: Overall Posts Summary across all use cases */}
                {!selectedUseCase &&
                  brandData?.target_use_cases &&
                  brandData.target_use_cases.length > 0 &&
                  (() => {
                    const allPosts = brandData.target_use_cases.flatMap(
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
                    const subredditCounts = allPosts.reduce<
                      Record<string, number>
                    >((acc, post) => {
                      acc[post.subreddit] = (acc[post.subreddit] || 0) + 1;
                      return acc;
                    }, {});
                    const topSubreddits = Object.entries(subredditCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6);

                    // Count posts containing each keyword (case-insensitive, phrase match by default)
                    const allKeywords = Array.from(
                      new Set(
                        brandData.target_use_cases
                          .flatMap((uc) => uc.keywords || [])
                          .map((k) => k.trim())
                          .filter(Boolean)
                      )
                    );
                    const topKeywords = getTopKeywordCounts(
                      allPosts,
                      allKeywords,
                      8
                    );

                    return (
                      <div
                        className="rounded-2xl p-6 space-y-6"
                        style={{
                          background: "rgba(255, 255, 255, 0.08)",
                          backdropFilter: "blur(20px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          boxShadow:
                            "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        }}
                      >
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
                    );
                  })()}
                {/* Total tab: Summary Table of all use cases */}
                {!selectedUseCase && brandData?.target_use_cases?.length
                  ? (() => {
                      const rows = brandData.target_use_cases.map((uc) => {
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
                        return {
                          id: uc.id,
                          title: uc.title,
                          potential: ucTotals.potential_customer,
                          competitor: ucTotals.competitor_mention,
                          keywords: uc.keywords || [],
                        };
                      });
                      return (
                        <div
                          className="rounded-2xl p-6"
                          style={{
                            background: "rgba(255, 255, 255, 0.06)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(255, 255, 255, 0.18)",
                          }}
                        >
                          <div className="text-white font-heading text-lg font-bold mb-3">
                            By Use Case
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                              <thead>
                                <tr className="text-left text-white/70">
                                  <th className="py-2 pr-4 font-body">
                                    Use Case
                                  </th>
                                  <th className="py-2 pr-4 font-body">
                                    Potential
                                  </th>
                                  <th className="py-2 pr-4 font-body">
                                    Competitor
                                  </th>
                                  <th className="py-2 pr-4 font-body">
                                    Keywords
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((row) => (
                                  <tr
                                    key={row.id}
                                    className="border-t border-white/10"
                                  >
                                    <td className="py-2 pr-4 text-white font-body">
                                      {row.title}
                                    </td>
                                    <td className="py-2 pr-4 text-emerald-300 font-heading">
                                      {row.potential}
                                    </td>
                                    <td className="py-2 pr-4 text-rose-300 font-heading">
                                      {row.competitor}
                                    </td>
                                    <td className="py-2 pr-4">
                                      <div className="flex flex-wrap gap-1">
                                        {row.keywords.length ? (
                                          row.keywords.slice(0, 8).map((kw) => (
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
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()
                  : null}

                {/* Selected Use Case: Activity for the chosen use case only */}
                {selectedUseCase
                  ? (() => {
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
                      const ucSubCounts = ucPosts.reduce<
                        Record<string, number>
                      >((acc, post) => {
                        acc[post.subreddit] = (acc[post.subreddit] || 0) + 1;
                        return acc;
                      }, {});
                      const ucTopSubs = Object.entries(ucSubCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5);
                      return (
                        <div
                          className="rounded-2xl p-6 space-y-4"
                          style={{
                            background: "rgba(255, 255, 255, 0.06)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(255, 255, 255, 0.18)",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2 rounded-xl"
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(59,130,246,0.28), rgba(99,102,241,0.28))",
                              }}
                            >
                              <svg
                                className="w-5 h-5 text-indigo-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V6a2 2 0 012-2h4a2 2 0 012 2v1m-1 0h1a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h1m10 0H7"
                                />
                              </svg>
                            </div>
                            <h3 className="text-white font-heading text-lg font-bold">
                              Use Case Activity — {uc.title}
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
                    })()
                  : null}

                {/* Insights View */}
                {selectedUseCase?.insights && (
                  <UseCaseInsightsComponent
                    insights={selectedUseCase.insights}
                    insightTitle={selectedUseCase.title}
                  />
                )}

                {/* Competitor Summary */}
                {selectedUseCase?.competitor_summary && (
                  <CompetitorSummary
                    summary={selectedUseCase.competitor_summary}
                    hotFeatures={selectedUseCase.hot_features_summary}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
