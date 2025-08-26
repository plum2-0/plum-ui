"use client";

import { useState } from "react";
import GlassPanel from "@/components/ui/GlassPanel";
import { Brand, RedditPostUI } from "@/types/brand";
import SwipeableProspectModal from "./SwipeableProspectModal";

interface ProspectTargetsProps {
  posts?: RedditPostUI[];
  // Precomputed stats passed from callers (BrandContext/DiscoverPage)
  uniqueUsers: number;
  uniquePendingAuthors: number;
  uniqueActionedAuthors: number;
  totalKeywordCounts?: number;
  totalPostsScraped?: number;
  onSwipe?: (args: {
    direction: "left" | "right";
    post: RedditPostUI;
  }) => void | Promise<void>;
  onStackCompleted?: () => void;
  label?: string;
  subtext?: string;
  problemToSolve?: string;
}

export default function ProspectTargetStat({
  posts = [],
  uniqueUsers,
  uniquePendingAuthors,
  uniqueActionedAuthors,
  totalKeywordCounts = 0,
  totalPostsScraped = 0,
  label = "Potential Customers Identified",
  subtext = "Click To View",
  onSwipe,
  onStackCompleted,
}: ProspectTargetsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    if (posts.length > 0) {
      setIsModalOpen(true);
    }
  };

  const handleStackCompleted = () => {
    onStackCompleted?.();
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className="flex justify-center cursor-pointer"
        onClick={handleCardClick}
      >
        <GlassPanel
          className="cursor-pointer relative group w-full max-w-md px-8 py-6 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
          variant="medium"
          style={{
            background:
              "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
            boxShadow:
              "0 8px 32px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          }}
        >
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "radial-gradient(circle at center, rgba(34, 197, 94, 0.1) 0%, transparent 70%)",
            }}
          />
          <div className="relative text-center bold ">
            <div className="text-lg text-white font-body mb-2">{label}</div>
            <div className="text-emerald-300 text-5xl font-heading font-bold">
              {uniqueUsers}
            </div>
            <div className="mt-2 flex items-center justify-center gap-3 text-xs text-white/70 font-body">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-400/70"></span>
                Pending {uniquePendingAuthors}
              </span>
              <span className="text-white/20">|</span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400/70"></span>
                Actioned {uniqueActionedAuthors}
              </span>
            </div>
            {uniqueUsers > 0 && (
              <div className="text-white/60 text-xs font-body mt-2">
                {subtext}
              </div>
            )}
            {totalPostsScraped > 0 && (
              <div className="text-white/40 text-xs font-body mt-3 italic">
                Analyzed {totalPostsScraped.toLocaleString()} posts and{" "}
                {totalKeywordCounts.toLocaleString()} keywords to find your
                ideal customers
              </div>
            )}
          </div>
        </GlassPanel>
      </div>

      {/* Swipeable Modal */}
      <SwipeableProspectModal
        isOpen={isModalOpen}
        posts={posts}
        onSwipe={onSwipe}
        onClose={() => setIsModalOpen(false)}
        onStackCompleted={handleStackCompleted}
      />
    </>
  );
}
