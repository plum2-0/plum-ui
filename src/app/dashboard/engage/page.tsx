"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Brand, UseCase, SubredditPost } from "@/types/brand";
import DashboardSidebar from "@/components/dashboard2/DashboardSidebar";
import RedditPostListItem from "@/components/dashboard2/RedditPostListItem";
import TagFiltersDropdown from "@/components/dashboard2/TagFiltersDropdown";

export default function EngagePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [brandData, setBrandData] = useState<Brand | null>(null);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    const savedFilters = localStorage.getItem("engageTagFilters");
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        setSelectedTags(new Set(filters));
      } catch (e) {
        console.error("Error loading saved filters:", e);
      }
    }
  }, []);

  // Load brand data from API
  useEffect(() => {
    const loadBrandData = async () => {
      try {
        const response = await fetch("/api/brand");

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.needsOnboarding) {
            router.push("/onboarding");
            return;
          }
          throw new Error(errorData.error || "Failed to fetch brand data");
        }

        const result = await response.json();
        const data: Brand = result.brand;
        setBrandData(data);
        if (data.target_use_cases.length > 0) {
          setSelectedUseCase(data.target_use_cases[0]);
        }
      } catch (error) {
        console.error("Error loading brand data:", error);
        setError(error instanceof Error ? error.message : "Failed to load brand data");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      loadBrandData();
    }
  }, [session, router]);

  // Reset pagination when use case changes
  useEffect(() => {
    setPage(1);
  }, [selectedUseCase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-white text-xl font-body">Loading posts...</div>
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

  const allPosts = selectedUseCase?.subreddit_posts || [];

  // Filter posts by selected tags
  const filteredPosts = allPosts.filter((post: SubredditPost) => {
    if (selectedTags.size === 0) return true;
    return Array.from(selectedTags).some((selectedTag) => {
      switch (selectedTag) {
        case "potential_customer":
          return post.tags?.potential_customer;
        case "competitor_mention":
          return post.tags?.competitor_mention;
        case "own_mention":
          return post.tags?.own_mention;
        case "positive_sentiment":
          return post.tags?.positive_sentiment;
        case "negative_sentiment":
          return post.tags?.negative_sentiment;
        default:
          return false;
      }
    });
  });

  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / pageSize);
  const startIndex = (page - 1) * pageSize;
  const visiblePosts = filteredPosts.slice(startIndex, startIndex + pageSize);

  const handleTagToggle = (tagName: string) => {
    setSelectedTags((prev) => {
      const newTags = new Set(prev);
      if (newTags.has(tagName)) {
        newTags.delete(tagName);
      } else {
        newTags.add(tagName);
      }
      localStorage.setItem("engageTagFilters", JSON.stringify(Array.from(newTags)));
      return newTags;
    });
    setPage(1);
  };

  const handleClearAllTags = () => {
    setSelectedTags(new Set());
    localStorage.removeItem("engageTagFilters");
    setPage(1);
  };

  const handleFetchNewPosts = async () => {
    if (!selectedUseCase || !brandData?.id) return;
    setIsFetchingPosts(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${backendUrl}/api/brand/${brandData.id}/new/posts?use_case_id=${selectedUseCase.id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json", "User-Agent": "Plum-UI/1.0" },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch new posts: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.status === "completed") {
        const totalDiscovered = result.total_posts_discovered || 0;
        const totalTagged = result.total_posts_tagged || 0;
        if (totalDiscovered > 0) {
          alert(`Success! Discovered ${totalDiscovered} new posts, tagged ${totalTagged} posts. Refreshing data...`);
        } else {
          alert("No new posts found at this time. Try again later!");
        }
        const brandResponse = await fetch("/api/brand");
        if (brandResponse.ok) {
          const brandResult = await brandResponse.json();
          const data: Brand = brandResult.brand;
          setBrandData(data);
          const updatedUseCase = data.target_use_cases.find((uc) => uc.id === selectedUseCase.id);
          if (updatedUseCase) setSelectedUseCase(updatedUseCase);
          setPage(1);
        }
      } else {
        throw new Error("Failed to complete new posts fetch");
      }
    } catch (error) {
      console.error("Error fetching new posts:", error);
      alert(`Failed to fetch new posts: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsFetchingPosts(false);
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="w-64 shrink-0">
        <DashboardSidebar
          useCases={brandData.target_use_cases}
          selectedUseCase={selectedUseCase}
          onUseCaseSelect={setSelectedUseCase}
          onlyUnread={onlyUnread}
          setOnlyUnread={setOnlyUnread}
        />
      </div>

      {/* Scrollable Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {selectedUseCase && (
              <div className="flex items-center justify-between">
                <h2 className="text-white font-heading text-xl font-bold">Engage — Reddit Posts</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleFetchNewPosts}
                    disabled={isFetchingPosts}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-body font-medium text-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.8))",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                      boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                      color: "white",
                    }}
                  >
                    {isFetchingPosts ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Fetching...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Fetch New Posts
                      </>
                    )}
                  </button>
                  <TagFiltersDropdown
                    posts={allPosts}
                    selectedTags={selectedTags}
                    onTagToggle={handleTagToggle}
                    onClearAll={handleClearAllTags}
                  />
                </div>
              </div>
            )}

            {/* Posts List */}
            <div className="space-y-4">
              {visiblePosts.length === 0 ? (
                <div
                  className="rounded-2xl p-8 text-center"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <p className="text-white/80 font-body">
                    {selectedTags.size > 0
                      ? "No posts found matching the selected filters."
                      : "No posts found for this use case."}
                  </p>
                </div>
              ) : (
                visiblePosts.map((post) => <RedditPostListItem key={post.id} post={post} />)
              )}
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex items-center justify-between gap-4 pb-6">
              <div className="text-sm text-white/70 font-body">
                Showing {totalPosts === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, totalPosts)} of {totalPosts}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`px-4 py-2 rounded-xl font-body font-medium text-sm transition-all ${
                    page > 1 ? "text-white hover:text-white" : "text-white/50 cursor-not-allowed"
                  }`}
                  style={{
                    background: page > 1 ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </button>
                <span className="text-white/80 font-body text-sm px-3">Page {page} / {totalPages}</span>
                <button
                  className={`px-4 py-2 rounded-xl font-body font-medium text-sm transition-all ${
                    page < totalPages ? "text-white hover:text-white" : "text-white/50 cursor-not-allowed"
                  }`}
                  style={{
                    background: page < totalPages ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

