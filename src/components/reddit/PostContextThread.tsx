"use client";

import React from 'react';
import { RedditPost } from '@/types/reddit';

interface PostContextThreadProps {
  post: RedditPost;
}

export function PostContextThread({ post }: PostContextThreadProps) {
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Parent Comment Context */}
      {post.parent_comment && (
        <div className="bg-gray-100 rounded-lg p-3 border-l-4 border-gray-400">
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
            <span className="font-medium">{post.parent_comment.author}</span>
            <span>•</span>
            <span>{formatTimeAgo(post.parent_comment.created_utc)}</span>
            <span>•</span>
            <span>{post.parent_comment.score} points</span>
          </div>
          <p className="text-sm text-gray-700">{post.parent_comment.body}</p>
        </div>
      )}

      {/* Main Post */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <span className="font-medium">r/{post.subreddit}</span>
              <span>•</span>
              <span>u/{post.author}</span>
              <span>•</span>
              <span>{post.time_ago}</span>
            </div>
          </div>
          {post.link_flair && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
              {post.link_flair}
            </span>
          )}
        </div>

        {/* Post Metrics */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M5 15l7-7 7 7" />
            </svg>
            {post.score} points
          </span>
          <span>{Math.round(post.upvote_ratio * 100)}% upvoted</span>
          <span>{post.comment_count} comments</span>
        </div>

        {/* External Link */}
        {!post.is_self && post.domain && (
          <div className="mb-3">
            <a 
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {post.domain}
            </a>
          </div>
        )}

        {/* Matched Topics & Confidence */}
        {(post.matched_topics || post.confidence_score !== undefined) && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
            {post.matched_topics && post.matched_topics.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Topics:</span>
                <div className="flex gap-1">
                  {post.matched_topics.map(topic => (
                    <span key={topic} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {post.confidence_score !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Confidence:</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round(post.confidence_score * 100)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* View on Reddit */}
        <div className="mt-3">
          <a
            href={`https://reddit.com${post.permalink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View full thread on Reddit →
          </a>
        </div>
      </div>
    </div>
  );
}