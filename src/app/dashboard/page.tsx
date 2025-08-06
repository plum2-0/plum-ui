"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlumLogo } from "@/components/PlumLogo";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRedditPosts } from "@/hooks/useRedditPosts";
import { usePostActions } from "@/hooks/usePostActions";
import { RedditPostCard } from "@/components/reddit/RedditPostCard";
import { UserAction } from "@/types/reddit";

type FilterStatus = "all" | "pending" | "reviewed";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Your Project");
  const [, setIsConfigComplete] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [currentOffset, setCurrentOffset] = useState(0);
  const [isFetchingNewPosts, setIsFetchingNewPosts] = useState(false);
  const limit = 20;

  // Check authentication
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Get project info
  useEffect(() => {
    async function fetchProjectInfo() {
      try {
        // Get project ID from cookie
        const cookieResponse = await fetch("/api/cookies/project_id");
        if (!cookieResponse.ok) {
          router.push("/onboarding");
          return;
        }
        const { value: projectIdValue } = await cookieResponse.json();
        if (!projectIdValue) {
          router.push("/onboarding");
          return;
        }
        setProjectId(projectIdValue);

        // Get onboarding state
        const stateResponse = await fetch("/api/onboarding/state");
        if (stateResponse.ok) {
          const state = await stateResponse.json();
          setProjectName(state.projectName || "Your Project");
          setIsConfigComplete(state.hasCompleteConfig || false);

          if (
            !state.hasCompleteConfig &&
            state.redirectTo &&
            state.redirectTo !== "/dashboard"
          ) {
            router.push(state.redirectTo);
          }
        }
      } catch (error) {
        console.error("Error fetching project info:", error);
      }
    }

    if (session?.user) {
      fetchProjectInfo();
    }
  }, [session, router]);

  const { data, isLoading, error, refetch } = useRedditPosts({
    projectId: projectId || "",
    status: filterStatus,
    limit,
    offset: currentOffset,
  });

  const { mutate: updatePostAction, isPending } = usePostActions({
    projectId: projectId || "",
    onSuccess: () => {
      console.log("Post action updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update post action:", error);
    },
  });

  const handleAction = (
    postId: string,
    action: UserAction,
    editedResponse?: string
  ) => {
    updatePostAction({ postId, action, editedResponse });
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    setCurrentOffset((prev) => prev + limit);
  };

  const handleFetchNewPosts = async () => {
    if (!projectId) return;

    setIsFetchingNewPosts(true);
    try {
      const response = await fetch(`/api/reddit/fetch-posts/${projectId}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch new posts");
      }

      // Refresh the posts list after fetching
      await refetch();
    } catch (error) {
      console.error("Error fetching new posts:", error);
    } finally {
      setIsFetchingNewPosts(false);
    }
  };

  const filterTabs: Array<{ value: FilterStatus; label: string }> = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "reviewed", label: "Reviewed" },
  ];

  if (status === "loading" || !projectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="p-6 bg-white/10 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlumLogo />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm">
              Welcome, {session?.user?.name || session?.user?.email}
            </span>
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
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Source Configuration */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Source Configuration
                  </h3>
                  <p className="text-purple-200 text-sm mb-4">
                    Configure subreddits, topics, and AI prompts
                  </p>
                  <Link
                    href="/onboarding/configure"
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Configure
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Quick Stats
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {data?.posts?.filter((p) => p.user_action === "pending")
                      .length || 0}
                  </div>
                  <div className="text-purple-200 text-xs">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {data?.posts?.filter((p) => p.user_action === "reply")
                      .length || 0}
                  </div>
                  <div className="text-purple-200 text-xs">Reply</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {data?.posts?.filter((p) => p.user_action === "ignore")
                      .length || 0}
                  </div>
                  <div className="text-purple-200 text-xs">Ignored</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reddit Post Action Manager */}
          <div className="space-y-6">
            {/* Header with filters */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => {
                        setFilterStatus(tab.value);
                        setCurrentOffset(0);
                      }}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        filterStatus === tab.value
                          ? "bg-purple-600 text-white"
                          : "bg-white/20 text-purple-200 hover:bg-white/30"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-purple-200">
                    {data?.total_count || 0} items
                  </span>
                  <button
                    onClick={handleFetchNewPosts}
                    disabled={isFetchingNewPosts}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors disabled:opacity-50"
                  >
                    <svg
                      className={`w-4 h-4 ${
                        isFetchingNewPosts ? "animate-spin" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    {isFetchingNewPosts ? "Fetching..." : "Fetch New Posts"}
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white/20 hover:bg-white/30 text-purple-200 rounded-md transition-colors disabled:opacity-50"
                  >
                    <svg
                      className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
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
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-300">
                  Error loading Reddit posts: {error.message}
                </p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading state */}
            {isLoading && currentOffset === 0 && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
                  >
                    <div className="animate-pulse">
                      <div className="h-4 bg-purple-300/20 rounded w-1/4 mb-4"></div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="h-6 bg-purple-300/20 rounded w-3/4"></div>
                          <div className="h-4 bg-purple-300/20 rounded w-1/2"></div>
                          <div className="h-20 bg-purple-300/20 rounded"></div>
                        </div>
                        <div className="h-32 bg-purple-300/20 rounded"></div>
                      </div>
                      <div className="h-10 bg-purple-300/20 rounded w-1/3 mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Posts list */}
            {!isLoading && data?.posts && (
              <>
                <div className="space-y-6">
                  {data.posts.map((post) => (
                    <div
                      key={post.post_id}
                      className="bg-white/10 backdrop-blur-sm rounded-lg"
                    >
                      <RedditPostCard
                        post={post}
                        onAction={handleAction}
                        isLoading={isPending}
                      />
                    </div>
                  ))}
                </div>

                {/* No posts message */}
                {data.posts.length === 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
                    <p className="text-purple-200">
                      No posts found matching your criteria.
                    </p>
                    <p className="text-purple-300 text-sm mt-2">
                      Posts will appear here once they are processed by the
                      matcher service.
                    </p>
                    <button
                      onClick={handleFetchNewPosts}
                      disabled={isFetchingNewPosts}
                      className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors disabled:opacity-50"
                    >
                      {isFetchingNewPosts
                        ? "Fetching..."
                        : "Fetch New Posts Now"}
                    </button>
                  </div>
                )}

                {/* Load more button */}
                {data.has_more && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        aria-label="Scroll to top"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </div>
  );
}
