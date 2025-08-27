"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Heart, Share2 } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import type { RedditPostUI } from "@/types/brand";
import { formatTimeAgo } from "@/components/dashboard2/RedditItemCommon";

interface TestPostCarouselProps {
  posts: RedditPostUI[];
  onPostSelect: (post: RedditPostUI) => void;
  selectedPostId?: string;
}

export default function TestPostCarousel({
  posts,
  onPostSelect,
  selectedPostId
}: TestPostCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : posts.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < posts.length - 1 ? prev + 1 : 0));
  };

  const handleSelectPost = (post: RedditPostUI) => {
    onPostSelect(post);
  };

  if (!posts || posts.length === 0) {
    return (
      <GlassPanel variant="light" className="p-8 text-center">
        <p className="text-white/60">No actioned posts available for testing</p>
      </GlassPanel>
    );
  }

  const currentPost = posts[currentIndex];

  return (
    <div className="space-y-4">
      {/* Carousel Controls */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Select a Post to Test ({currentIndex + 1} of {posts.length})
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            disabled={posts.length <= 1}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            disabled={posts.length <= 1}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Current Post Display */}
      <GlassPanel 
        variant="light"
        className={`p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
          selectedPostId === currentPost.thing_id ? 'ring-2 ring-green-500' : ''
        }`}
        onClick={() => handleSelectPost(currentPost)}
      >
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span className="text-orange-400">r/{currentPost.subreddit}</span>
            <span>•</span>
            <span>u/{currentPost.author}</span>
            <span>•</span>
            <span>{formatTimeAgo(new Date(currentPost.created_utc * 1000).toISOString())}</span>
          </div>
        </div>

        {/* Post Title */}
        {currentPost.title && (
          <h4 className="text-xl font-bold text-white mb-3">
            {currentPost.title}
          </h4>
        )}

        {/* Post Content */}
        <div className="text-white/90 mb-4 line-clamp-4">
          {currentPost.content}
        </div>

        {/* Post Stats */}
        <div className="flex items-center gap-4 text-sm text-white/60">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{currentPost.upvotes || currentPost.score || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{currentPost.reply_count || 0} comments</span>
          </div>
          <div className="flex items-center gap-1">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </div>
        </div>

        {/* Selection Indicator */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSelectPost(currentPost);
            }}
            className="w-full py-2 px-4 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105"
            style={{
              background: selectedPostId === currentPost.thing_id
                ? "linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.8))"
                : "linear-gradient(135deg, rgba(168, 85, 247, 0.6), rgba(34, 197, 94, 0.6))",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            }}
          >
            {selectedPostId === currentPost.thing_id ? "Testing This Post..." : "Select for Testing"}
          </button>
        </div>
      </GlassPanel>

      {/* Mini Preview Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {posts.map((post, index) => (
          <button
            key={post.thing_id}
            onClick={() => setCurrentIndex(index)}
            className={`shrink-0 p-2 px-3 rounded-lg text-xs transition-all ${
              index === currentIndex
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}