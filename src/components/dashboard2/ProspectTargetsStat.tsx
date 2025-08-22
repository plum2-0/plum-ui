"use client";

import { useState } from "react";
import GlassPanel from "@/components/ui/GlassPanel";
import { RedditPost } from "@/types/brand";
import SwipeableProspectModal from "./SwipeableProspectModal";
import { RedditPostWithProspect } from "@/app/swipe/page";

interface ProspectTargetsProps {
  posts?: RedditPost[];
  brandId: string;
  brandName?: string;
  brandDetail?: string;
  prospectId: string;
  problemToSolve?: string;
  onStackCompleted?: () => void;
  label?: string;
  subtext?: string;
}

export default function ProspectTargetStat({
  posts = [],
  brandId,
  brandName,
  brandDetail,
  prospectId,
  problemToSolve,
  onStackCompleted,
  label = "Potential Customers Identified",
  subtext = "Click To View",
}: ProspectTargetsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dedupe posts based on thing_id
  const uniquePosts = posts.filter(
    (post, index, self) =>
      index === self.findIndex((p) => p.thing_id === post.thing_id)
  );

  // Map to RedditPostWithProspect format
  const uniquePostsWithProspect: RedditPostWithProspect[] = uniquePosts.map(
    (post) => ({
      ...post,
      prospect_id: prospectId,
    })
  );

  // Get unique Reddit users
  const uniqueUsers = new Set(uniquePosts.map((post) => post.author)).size;

  const handleCardClick = () => {
    if (uniquePosts.length > 0) {
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
            {uniqueUsers > 0 && (
              <div className="text-white/60 text-xs font-body mt-2">
                {subtext}
              </div>
            )}
          </div>
        </GlassPanel>
      </div>

      {/* Swipeable Modal */}
      <SwipeableProspectModal
        isOpen={isModalOpen}
        posts={uniquePostsWithProspect}
        brandId={brandId}
        brandName={brandName}
        brandDetail={brandDetail}
        prospectId={prospectId}
        problemToSolve={problemToSolve}
        onClose={() => setIsModalOpen(false)}
        onStackCompleted={handleStackCompleted}
      />
    </>
  );
}
