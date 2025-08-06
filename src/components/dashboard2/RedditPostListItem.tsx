"use client";

import { useState } from "react";
import { SubredditPost } from "@/types/brand";
import TagBadge from "./TagBadge";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface RedditPostListItemProps {
  post: SubredditPost;
}

export default function RedditPostListItem({ post }: RedditPostListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  // Extract mention info (e.g., "todoist" from the llm_explanation)
  const getMentionedBrand = () => {
    const match = post.llm_explanation.match(/\b(todoist|ticktick|notion|obsidian)\b/i);
    return match ? match[1].toLowerCase() : null;
  };

  const mentionedBrand = getMentionedBrand();

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Subreddit mention */}
          <div className="flex items-center gap-2 text-sm text-purple-300 mb-2">
            <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            <span>
              Mention of {mentionedBrand && <span className="font-semibold text-orange-400">{mentionedBrand}</span>} in r/{post.subreddit}
            </span>
            <span className="text-purple-400">•</span>
            <span>{formatTimeAgo(post.created_at)} by {post.author}</span>
          </div>

          {/* Post title */}
          <h3 className="text-white font-medium mb-3">{post.title}</h3>

          {/* Post content preview */}
          <div className={`text-purple-100 text-sm ${!isExpanded ? 'line-clamp-3' : ''}`}>
            {post.content || post.llm_explanation}
          </div>

          {/* Expand/Collapse button */}
          {(post.content && post.content.length > 200) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  Show less <ChevronUpIcon className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show more <ChevronDownIcon className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.negative_sentiment && <TagBadge label="Negative" variant="negative" />}
            {post.tags.positive_sentiment && <TagBadge label="Positive" variant="positive" />}
            {post.tags.neutral_sentiment && <TagBadge label="Neutral" variant="neutral" />}
            {post.tags.competitor_mention && <TagBadge label="Competitor Mention" variant="competitor" />}
            {post.tags.potential_customer && <TagBadge label="Potential Customer" variant="customer" />}
            {post.tags.own_mention && <TagBadge label="Own Mention" variant="default" />}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <button className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 text-purple-200 rounded-md transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Bug Report
            </button>
            <button className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 text-purple-200 rounded-md transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Product Question
            </button>
            <button className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 text-purple-200 rounded-md transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Buy Intent
            </button>
          </div>
        </div>

        {/* Post stats */}
        <div className="flex flex-col items-end gap-2 ml-4">
          <div className="flex items-center gap-1 text-sm text-purple-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            {post.up_votes}
          </div>
          <div className="flex items-center gap-1 text-sm text-purple-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {post.num_comments}
          </div>
        </div>
      </div>
    </div>
  );
}