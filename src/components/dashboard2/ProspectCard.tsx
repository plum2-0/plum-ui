"use client";

import { RedditPost } from "@/types/brand";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface ProspectCardProps {
  post: RedditPost;
  className?: string;
}

export default function ProspectCard({ post, className = "" }: ProspectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format timestamp
  const timeAgo = formatDistanceToNow(new Date(post.created_utc * 1000), {
    addSuffix: true,
  });

  // Truncate content for preview
  const maxLength = 280;
  const shouldTruncate = post.content && post.content.length > maxLength;
  const displayContent = shouldTruncate && !isExpanded
    ? post.content.substring(0, maxLength) + "..."
    : post.content;

  return (
    <div
      className={`w-full max-w-lg rounded-2xl p-6 ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-white font-heading text-lg font-bold mb-2 line-clamp-2">
            {post.title}
          </h3>
          <div className="flex items-center gap-3 text-sm">
            {/* Subreddit Badge */}
            <div
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{
                background: "linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(254, 215, 170, 0.2))",
                border: "1px solid rgba(251, 146, 60, 0.3)",
              }}
            >
              <span className="text-orange-300 font-medium">r/{post.subreddit}</span>
            </div>
            
            {/* Author */}
            <span className="text-white/60">by u/{post.author}</span>
            
            {/* Time */}
            <span className="text-white/40">{timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div className="mb-4">
          <p className="text-white/80 font-body text-sm leading-relaxed whitespace-pre-wrap">
            {displayContent}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              {isExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* Metrics */}
      <div className="flex items-center gap-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-emerald-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          <span className="text-white/70 text-sm">{post.score}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-blue-400"
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
          <span className="text-white/70 text-sm">{post.reply_count}</span>
        </div>

        {/* Link Flair */}
        {post.link_flair && (
          <div
            className="ml-auto px-2 py-1 rounded text-xs font-medium"
            style={{
              background: "rgba(168, 85, 247, 0.2)",
              color: "rgb(216, 180, 254)",
              border: "1px solid rgba(168, 85, 247, 0.3)",
            }}
          >
            {post.link_flair}
          </div>
        )}
      </div>

      {/* Suggested Reply (if exists) */}
      {post.suggested_agent_reply && (
        <div
          className="mt-4 p-3 rounded-lg"
          style={{
            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(168, 85, 247, 0.1))",
            border: "1px solid rgba(34, 197, 94, 0.2)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-emerald-300 text-xs font-semibold">Suggested Reply</span>
          </div>
          <p className="text-white/70 text-xs font-body leading-relaxed">
            {post.suggested_agent_reply}
          </p>
        </div>
      )}
    </div>
  );
}