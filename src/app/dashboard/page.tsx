"use client";

import { useState, useEffect } from "react";
import { PlumSproutLogo } from "@/components/PlumSproutLogo";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Brand, UseCase, SubredditPost } from "@/types/brand";
import UseCasesSidebar from "@/components/dashboard2/UseCasesSidebar";
import CompetitorSummary from "@/components/dashboard2/CompetitorSummary";
import RedditPostListItem from "@/components/dashboard2/RedditPostListItem";
import TagFilters from "@/components/dashboard2/TagFilters";
import InviteTeammateButton from "@/components/InviteTeammateButton";

export default function Dashboard2Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [brandData, setBrandData] = useState<Brand | null>(null);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const pageSize = 10;

  // Check authentication
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Load saved filter preferences from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem("dashboardTagFilters");
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

        // Select first use case by default
        if (data.target_use_cases.length > 0) {
          setSelectedUseCase(data.target_use_cases[0]);
        }
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

  console.log(JSON.stringify(brandData, null, 2));

  // Reset pagination when changing use case
  useEffect(() => {
    setPage(1);
  }, [selectedUseCase]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-300 text-xl mb-4">
            Error loading brand data
          </div>
          <div className="text-white/80 mb-6">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!brandData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white">No data available</div>
      </div>
    );
  }

  const allPosts = selectedUseCase?.subreddit_posts || [];

  // Filter posts based on selected tags
  const filteredPosts =
    selectedTags.size === 0
      ? allPosts
      : allPosts.filter((post: SubredditPost) => {
          // Show posts that have ANY of the selected tags
          if (
            selectedTags.has("potential_customer") &&
            post.tags.potential_customer
          )
            return true;
          if (
            selectedTags.has("competitor_mention") &&
            post.tags.competitor_mention
          )
            return true;
          if (selectedTags.has("own_mention") && post.tags.own_mention)
            return true;
          return false;
        });

  const totalPosts = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));
  const startIndex = (page - 1) * pageSize;
  const visiblePosts = filteredPosts.slice(startIndex, startIndex + pageSize);

  // Tag handling functions
  const handleTagToggle = (tagName: string) => {
    setSelectedTags((prev) => {
      const newTags = new Set(prev);
      if (newTags.has(tagName)) {
        newTags.delete(tagName);
      } else {
        newTags.add(tagName);
      }
      // Save to localStorage
      localStorage.setItem(
        "dashboardTagFilters",
        JSON.stringify(Array.from(newTags))
      );
      return newTags;
    });
    // Reset to page 1 when filters change
    setPage(1);
  };

  const handleClearAllTags = () => {
    setSelectedTags(new Set());
    localStorage.removeItem("dashboardTagFilters");
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="p-6 bg-white/10 backdrop-blur-sm shrink-0">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlumSproutLogo className="w-8 h-8" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm">
              Welcome, {session?.user?.name || session?.user?.email}
            </span>
            <InviteTeammateButton brandId={session?.user?.brandId || null} />
            <Link
              href="/api/auth/signout"
              className="text-white/60 hover:text-white text-sm"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <UseCasesSidebar
          useCases={brandData.target_use_cases}
          selectedUseCase={selectedUseCase}
          onUseCaseSelect={setSelectedUseCase}
          onlyUnread={onlyUnread}
          setOnlyUnread={setOnlyUnread}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Competitor Summary */}
            {selectedUseCase?.competitor_summary && (
              <CompetitorSummary
                summary={selectedUseCase.competitor_summary}
                hotFeatures={selectedUseCase.hot_features_summary}
              />
            )}

            {/* Tag Filters */}
            <TagFilters
              posts={allPosts}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              onClearAll={handleClearAllTags}
            />

            {/* Reddit Posts */}
            <div className="space-y-4">
              {visiblePosts.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
                  <p className="text-purple-200">
                    {selectedTags.size > 0
                      ? "No posts found matching the selected filters."
                      : "No posts found for this use case."}
                  </p>
                </div>
              ) : (
                visiblePosts.map((post) => (
                  <RedditPostListItem key={post.id} post={post} />
                ))
              )}
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="text-sm text-purple-200">
                Showing {totalPosts === 0 ? 0 : startIndex + 1}–
                {Math.min(startIndex + pageSize, totalPosts)} of {totalPosts}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    page > 1
                      ? "bg-white/10 text-purple-200 hover:bg-white/20"
                      : "bg-white/5 text-purple-300/50 cursor-not-allowed"
                  }`}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </button>
                <span className="text-purple-200 text-sm">
                  Page {page} / {totalPages}
                </span>
                <button
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    page < totalPages
                      ? "bg-white/10 text-purple-200 hover:bg-white/20"
                      : "bg-white/5 text-purple-300/50 cursor-not-allowed"
                  }`}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
