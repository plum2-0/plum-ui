"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Brand, UseCase } from "@/types/brand";
import DashboardSidebar from "@/components/dashboard2/DashboardSidebar";
import CompetitorSummary from "@/components/dashboard2/CompetitorSummary";
import UseCaseInsightsComponent from "@/components/dashboard2/UseCaseInsights";

export default function Dashboard2Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const [brandData, setBrandData] = useState<Brand | null>(null);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingUseCaseId, setLoadingUseCaseId] = useState<string | null>(null);

  // No posts filters needed when showing insights-only view

  // Load brand data from API
  useEffect(() => {
    const loadBrandData = async () => {
      try {
        const response = await fetch("/api/brand");

        if (!response.ok) {
          const errorData = await response.json();

          // If user needs onboarding, redirect them
          if (errorData.needsOnboarding) {
            router.push("/onboarding");
            return;
          }

          throw new Error(errorData.error || "Failed to fetch brand data");
        }

        const result = await response.json();
        const data: Brand = result.brand;

        setBrandData(data);

        // Default to Total (no specific use case selected)
        setSelectedUseCase(null);
      } catch (error) {
        console.error("Error loading brand data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load brand data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      loadBrandData();
    }
  }, [session, router]);

  const handleAddUseCase = (title: string) => {
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

    // Optimistically add and select
    setBrandData((prev) =>
      prev
        ? { ...prev, target_use_cases: [...prev.target_use_cases, tempUseCase] }
        : prev
    );
    setSelectedUseCase(tempUseCase);
    setLoadingUseCaseId(tempId);

    // Fire backend in background, then refetch brand, select the new one
    void (async () => {
      try {
        const query = encodeURIComponent(title);
        const url = `http://localhost:8000/api/brand/${brandId}/insight?use_case=${query}`;
        const res = await fetch(url, {
          method: "GET",
          headers: { "User-Agent": "plum-ui" },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to generate insight: ${res.status} ${text}`);
        }

        // Ignore body; we will refetch brand to pick up the new persisted use case
        // Refetch brand to get fresh data
        const brandRes = await fetch("/api/brand");
        if (!brandRes.ok) {
          const text = await brandRes.text();
          throw new Error(`Refetch brand failed: ${brandRes.status} ${text}`);
        }
        const brandJson = await brandRes.json();
        const refreshed: Brand = brandJson.brand;

        // Find the created use case by matching title
        const created = refreshed.target_use_cases.find(
          (uc) => uc.title.trim().toLowerCase() === title.trim().toLowerCase()
        );

        setBrandData(refreshed);
        if (created) {
          setSelectedUseCase(created);
        }
      } catch (e) {
        console.error(e);
        // Remove the temp use case on failure
        setBrandData((prev) =>
          prev
            ? {
                ...prev,
                target_use_cases: prev.target_use_cases.filter(
                  (uc) => uc.id !== tempId
                ),
              }
            : prev
        );
        if (selectedUseCase?.id === tempId) {
          setSelectedUseCase(() => {
            // fallback to first use case if available
            const first = brandData?.target_use_cases[0];
            return first ?? null;
          });
        }
        setError(e instanceof Error ? e.message : "Failed to generate insight");
      } finally {
        setLoadingUseCaseId((prev) => (prev === tempId ? null : prev));
      }
    })();

    // Return a resolved promise so the input can close immediately
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
        <div className="text-red-300 text-xl font-body">Error: {error}</div>
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

                    // Aggregate keywords across all use cases (simple frequency by occurrence in each use case array)
                    const keywordFrequency: Record<string, number> = {};
                    brandData.target_use_cases.forEach((uc) => {
                      (uc.keywords || []).forEach((kw) => {
                        const key = kw.trim().toLowerCase();
                        if (!key) return;
                        keywordFrequency[key] =
                          (keywordFrequency[key] || 0) + 1;
                      });
                    });
                    const topKeywords = Object.entries(keywordFrequency)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 8);

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
                                d="M3 10h11M9 21V3m7 18v-6m5 6V10"
                              />
                            </svg>
                          </div>
                          <h2 className="text-white font-heading text-xl font-bold">
                            Community Activity Summary
                          </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div
                            className="p-4 rounded-xl"
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              backdropFilter: "blur(10px)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <div className="text-white/70 text-xs font-body mb-1">
                              Total Posts
                            </div>
                            <div className="text-white text-2xl font-heading font-bold">
                              {totalPosts}
                            </div>
                          </div>
                          <div
                            className="p-4 rounded-xl"
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              backdropFilter: "blur(10px)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <div className="text-white/70 text-xs font-body mb-1">
                              Potential Customers
                            </div>
                            <div className="text-emerald-300 text-2xl font-heading font-bold">
                              {tagTotals.potential_customer}
                            </div>
                          </div>
                          <div
                            className="p-4 rounded-xl"
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              backdropFilter: "blur(10px)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <div className="text-white/70 text-xs font-body mb-1">
                              Competitor Mentions
                            </div>
                            <div className="text-rose-300 text-2xl font-heading font-bold">
                              {tagTotals.competitor_mention}
                            </div>
                          </div>
                          <div
                            className="p-4 rounded-xl"
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              backdropFilter: "blur(10px)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <div className="text-white/70 text-xs font-body mb-1">
                              Own Mentions
                            </div>
                            <div className="text-indigo-300 text-2xl font-heading font-bold">
                              {tagTotals.own_mention}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div
                            className="p-4 rounded-xl"
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              backdropFilter: "blur(10px)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <div className="text-white/70 text-xs font-body mb-3">
                              Top Keywords
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {topKeywords.length === 0 ? (
                                <span className="text-white/60 font-body text-sm">
                                  No keywords yet
                                </span>
                              ) : (
                                topKeywords.map(([kw, count]) => (
                                  <span
                                    key={kw}
                                    className="px-3 py-1 rounded-full text-sm font-body text-white/90"
                                    style={{
                                      background: "rgba(255, 255, 255, 0.08)",
                                      border:
                                        "1px solid rgba(255, 255, 255, 0.15)",
                                    }}
                                  >
                                    {kw} · {count}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                          <div
                            className="p-4 rounded-xl"
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              backdropFilter: "blur(10px)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <div className="text-white/70 text-xs font-body mb-3">
                              Top Subreddits
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {topSubreddits.length === 0 ? (
                                <span className="text-white/60 font-body text-sm">
                                  No subreddit data yet
                                </span>
                              ) : (
                                topSubreddits.map(([name, count]) => (
                                  <span
                                    key={name}
                                    className="px-3 py-1 rounded-full text-sm font-body text-white/90"
                                    style={{
                                      background: "rgba(255, 255, 255, 0.08)",
                                      border:
                                        "1px solid rgba(255, 255, 255, 0.15)",
                                    }}
                                  >
                                    r/{name} · {count}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
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
                            Use Case Summary
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
                                  d="M3 7h18M3 12h18M3 17h18"
                                />
                              </svg>
                            </div>
                            <h3 className="text-white font-heading text-lg font-bold">
                              Use Case Activity — {uc.title}
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                            <div
                              className="p-3 rounded-lg"
                              style={{
                                background: "rgba(255, 255, 255, 0.04)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                              }}
                            >
                              <div className="text-white/70 text-xs font-body mb-1">
                                Tags
                              </div>
                              <div className="flex gap-4 text-sm font-heading">
                                <span className="text-emerald-300">
                                  Potential · {ucTotals.potential_customer}
                                </span>
                                <span className="text-rose-300">
                                  Competitor · {ucTotals.competitor_mention}
                                </span>
                                <span className="text-indigo-300">
                                  Own · {ucTotals.own_mention}
                                </span>
                              </div>
                            </div>

                            <div
                              className="p-3 rounded-lg"
                              style={{
                                background: "rgba(255, 255, 255, 0.04)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                              }}
                            >
                              <div className="text-white/70 text-xs font-body mb-1">
                                Keywords
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {uc.keywords && uc.keywords.length ? (
                                  uc.keywords.slice(0, 12).map((kw) => (
                                    <span
                                      key={kw}
                                      className="px-2 py-0.5 rounded-full text-xs font-body text-white/90"
                                      style={{
                                        background: "rgba(255, 255, 255, 0.08)",
                                        border:
                                          "1px solid rgba(255, 255, 255, 0.15)",
                                      }}
                                    >
                                      {kw}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-white/60 text-xs font-body">
                                    No keywords
                                  </span>
                                )}
                              </div>
                            </div>

                            <div
                              className="p-3 rounded-lg"
                              style={{
                                background: "rgba(255, 255, 255, 0.04)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                              }}
                            >
                              <div className="text-white/70 text-xs font-body mb-1">
                                Top Subreddits
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {ucTopSubs.length ? (
                                  ucTopSubs.map(([name, count]) => (
                                    <span
                                      key={name}
                                      className="px-2 py-0.5 rounded-full text-xs font-body text-white/90"
                                      style={{
                                        background: "rgba(255, 255, 255, 0.08)",
                                        border:
                                          "1px solid rgba(255, 255, 255, 0.15)",
                                      }}
                                    >
                                      r/{name} · {count}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-white/60 text-xs font-body">
                                    No subreddit data
                                  </span>
                                )}
                              </div>
                            </div>
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
