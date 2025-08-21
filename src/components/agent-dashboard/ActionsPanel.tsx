"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import GlassPanel from "@/components/ui/GlassPanel";

interface CommentSuggestion {
  action_id: string;
  brand_id: string;
  status: "pending" | "scheduled" | "completed" | "dismissed";
  action_title: string;
  post: {
    id: string;
    post_id: string;
    subreddit: string;
    title: string;
    author: string;
    content: string;
    link: string;
    image?: string | null;
    up_votes?: number;
    num_comments?: number;
  };
  llm_generated_reply: string;
  intent?: string;
  problem?: string;
}

interface InitiativesPanelProps {
  refreshKey: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function ActionsPanel({
  refreshKey,
  onRefresh,
  isRefreshing,
}: InitiativesPanelProps) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useQuery<{
    suggestions: CommentSuggestion[];
  }>({
    queryKey: ["comment-suggestions", refreshKey],
    queryFn: async () => {
      setErrorMsg(null);
      const resp = await fetch("/api/engagement/comment-suggestions");
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Failed to load suggestions");
      }
      return resp.json();
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const suggestions: CommentSuggestion[] = Array.isArray(data?.suggestions)
    ? data!.suggestions
    : [];

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-pulse">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4">
              <div className="h-6 bg-white/10 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-heading font-bold text-white">
            AI Suggested Replies
          </h2>
          {onRefresh && (
            <GlassPanel
              as="button"
              onClick={onRefresh}
              disabled={isRefreshing || isFetching}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-body font-medium text-sm text-white transition-all duration-300 ${
                isRefreshing || isFetching
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105"
              }`}
              variant="light"
            >
              <svg
                className={`w-4 h-4 ${
                  isRefreshing || isFetching ? "animate-spin" : ""
                }`}
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
              {isRefreshing || isFetching ? "Loading..." : "Refresh"}
            </GlassPanel>
          )}
        </div>
      </div>

      {errorMsg && <div className="mb-3 text-sm text-red-300">{errorMsg}</div>}

      {/* Suggestions List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {suggestions.length === 0 && (
          <div className="text-white/60 text-sm">No suggestions yet.</div>
        )}

        {suggestions.map((s) => (
          <div
            key={s.action_id}
            className="glass-card rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300 group"
          >
            {/* Subreddit and title */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                    comment
                  </span>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-white mb-1 line-clamp-2">
              {s.post.title}
            </h3>
            <div className="text-xs text-white/60 mb-2">
              Posted in{" "}
              <span className="text-purple-300">r/{s.post.subreddit}</span>
              {" • "}by <span className="text-white/80">u/{s.post.author}</span>
            </div>
            <a
              href={s.post.link}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-300 hover:underline"
            >
              View post ↗
            </a>

            {/* Post preview */}
            <div className="mt-3 text-sm text-white/80 bg-white/5 rounded-md p-3 border border-white/10 line-clamp-6 whitespace-pre-wrap">
              {s.post.content}
            </div>

            {/* Suggested reply */}
            <div className="mt-4">
              <div className="text-xs uppercase tracking-wide text-white/50 mb-1">
                Suggested reply
              </div>
              <div className="text-sm text-emerald-200 bg-emerald-500/10 rounded-md p-3 border border-emerald-500/20 whitespace-pre-wrap">
                {s.llm_generated_reply}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() =>
                  router.push(`/dashboard/engage/actions/${s.action_id}`)
                }
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium transition-all"
              >
                Edit
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs font-medium transition-all">
                Schedule
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium transition-all">
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
