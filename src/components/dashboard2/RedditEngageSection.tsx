"use client";

import { useEffect, useState } from "react";
import { Prospect, RedditPost } from "@/types/brand";
import RedditPostListItem from "./RedditPostListItem";
// import TagFiltersDropdown from "./TagFiltersDropdown"; // TODO: Re-enable when tags are implemented
import { useFetchNewPosts } from "@/hooks/api/useBrandQuery";

interface RedditEngageSectionProps {
  selectedProblem: Prospect | null;
  brandId?: string;
}

export default function RedditEngageSection({
  selectedProblem,
  brandId,
}: RedditEngageSectionProps) {
  const [page, setPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const pageSize = 10;
  const fetchNewPosts = useFetchNewPosts();

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

  // Reset pagination when use case changes
  useEffect(() => {
    setPage(1);
  }, [selectedProblem]);

  if (!selectedProblem) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <p className="text-white/80 font-body">
          Select a use case from the sidebar to view Reddit posts and engagement
          options.
        </p>
      </div>
    );
  }

  const allPosts: RedditPost[] = selectedProblem.sourced_reddit_posts || [];

  // TODO: Update filtering logic when tags are implemented in new API
  // For now, show all posts as filtering isn't available yet
  const filteredPosts = allPosts;

  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / pageSize);
  const startIndex = (page - 1) * pageSize;
  const visiblePosts = filteredPosts.slice(startIndex, startIndex + pageSize);

  // Tag filtering temporarily disabled

  // const handleClearAllTags = () => {};

  const handleFetchNewPosts = async () => {
    if (!selectedProblem || !brandId) return;

    await fetchNewPosts.mutateAsync({
      brandId,
      problemId: selectedProblem.id,
    });

    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h2 className="text-white font-heading text-xl font-bold">
            Sourced Reddit Posts
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleFetchNewPosts}
            disabled={fetchNewPosts.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-body font-medium text-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                "linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.8))",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
              color: "white",
            }}
          >
            {fetchNewPosts.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Fetching...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Fetch New Posts
              </>
            )}
          </button>
          {/* TODO: Re-enable when tags are implemented in new API */}
          {/* <TagFiltersDropdown
            posts={allPosts}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onClearAll={handleClearAllTags}
          /> */}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {visiblePosts.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            }}
          >
            <p className="text-white/80 font-body">
              {selectedTags.size > 0
                ? "No posts found matching the selected filters."
                : "No posts found for this use case."}
            </p>
          </div>
        ) : (
          visiblePosts.map((redditPost) => (
            <RedditPostListItem
              key={redditPost.thing_id}
              post={redditPost}
              brandId={brandId}
            />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPosts > 0 && (
        <div className="mt-6 flex items-center justify-between gap-4 pb-6">
          <div className="text-sm text-white/70 font-body">
            Showing {totalPosts === 0 ? 0 : startIndex + 1}–
            {Math.min(startIndex + pageSize, totalPosts)} of {totalPosts}
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`px-4 py-2 rounded-xl font-body font-medium text-sm transition-all ${
                page > 1
                  ? "text-white hover:text-white"
                  : "text-white/50 cursor-not-allowed"
              }`}
              style={{
                background:
                  page > 1
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>
            <span className="text-white/80 font-body text-sm px-3">
              Page {page} / {totalPages}
            </span>
            <button
              className={`px-4 py-2 rounded-xl font-body font-medium text-sm transition-all ${
                page < totalPages
                  ? "text-white hover:text-white"
                  : "text-white/50 cursor-not-allowed"
              }`}
              style={{
                background:
                  page < totalPages
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(255, 255, 255, 0.05)",
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
      )}
    </div>
  );
}
