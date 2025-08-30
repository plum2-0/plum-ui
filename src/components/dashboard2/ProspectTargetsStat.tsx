"use client";

import { useState } from "react";
import GlassPanel from "@/components/ui/GlassPanel";
import { RedditPostUI } from "@/types/brand";
import SwipeableProspectModal from "./SwipeableProspectModal";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import { useSubscription } from "@/hooks/useSubscription";
import { useBrand } from "@/contexts/BrandContext";

const MONTHLY_SCRAPE_LIMIT = 100; // Pro tier monthly limit

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
  onModalClose?: () => void;
  label?: string;
  problemToSolve?: string;
}

export default function ProspectTargetStat({
  posts = [],
  uniqueUsers,
  uniquePendingAuthors,
  uniqueActionedAuthors,
  totalKeywordCounts = 0,
  totalPostsScraped = 0,
  label = "Potential Leads",
  onSwipe,
  onStackCompleted,
  onModalClose,
}: ProspectTargetsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { checkAccess, remainingJobs } = useSubscription();
  const { scrapeJobsThisMonth } = useBrand();

  const handleCardClick = async () => {
    if (posts.length > 0) {
      // Check subscription status
      console.log('Checking subscription access...');
      const hasAccess = await checkAccess();
      console.log('Has access:', hasAccess);
      console.log('Remaining jobs:', remainingJobs);
      
      if (hasAccess) {
        // User has access, open the modal
        console.log('User has access, opening modal...');
        setIsModalOpen(true);
      } else {
        console.log('User does not have access, showing paywall...');
        setShowPaywall(true);
      }
    }
  };

  const handleStackCompleted = () => {
    onStackCompleted?.();
    setIsModalOpen(false);
  };

  const progressPercentage =
    uniqueUsers > 0
      ? Math.round((uniqueActionedAuthors / uniqueUsers) * 100)
      : 0;

  return (
    <>
      <div
        className="flex justify-center cursor-pointer"
        onClick={handleCardClick}
      >
        <GlassPanel
          className="cursor-pointer relative group w-full max-w-md px-8 py-6 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
          variant="medium"
          data-tour="prospect-target-stat"
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
          <div className="relative text-center">
            <div className="text-lg text-white font-body mb-4">{label}</div>

            {/* Main number display */}
            <div className="text-emerald-300 text-5xl font-heading font-bold mb-6">
              {uniqueUsers}
            </div>

            {/* Progress bar and breakdown */}
            <div className="space-y-3">
              {/* Visual progress bar */}
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Numbers breakdown */}
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1 text-left">
                  <div className="text-emerald-400 text-2xl font-heading font-bold">
                    {uniqueActionedAuthors}
                  </div>
                  <div className="text-emerald-400/70 text-xs font-body uppercase tracking-wider">
                    Engaged
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <span className="text-white/40 text-sm">⬅️</span>
                  </div>
                </div>

                <div className="flex-1 text-right">
                  <div className="text-orange-300 text-2xl font-heading font-bold">
                    {uniquePendingAuthors}
                  </div>
                  <div className="text-orange-300/70 text-xs font-body uppercase tracking-wider">
                    To Review
                  </div>
                </div>
              </div>

              {/* CTA button */}
              {uniquePendingAuthors > 0 && (
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-400/10 backdrop-blur-sm border border-orange-400/30 text-orange-300 text-sm md:text-base font-body transition-all duration-200 group-hover:from-orange-500/20 group-hover:to-orange-400/20 group-hover:border-orange-400/50">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                    <span className="font-medium">Tap to review</span>
                    <span className="text-orange-300/60">→</span>
                  </div>
                </div>
              )}

              {/* All reviewed state */}
              {uniquePendingAuthors === 0 && uniqueActionedAuthors > 0 && (
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 backdrop-blur-sm border border-emerald-400/30 text-emerald-300 text-sm md:text-base font-body">
                    <span className="text-emerald-400">✓</span>
                    <span className="font-medium">All Leads Reviewed!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer stats */}
            {totalPostsScraped > 0 && (
              <div className="text-white/40 text-xs font-body mt-4 italic">
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
        onClose={() => {
          setIsModalOpen(false);
          onModalClose?.();
        }}
        onStackCompleted={handleStackCompleted}
      />
      
      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSuccess={() => {
          setShowPaywall(false);
          setIsModalOpen(true);
        }}
        remainingJobs={remainingJobs}
        usedJobs={scrapeJobsThisMonth}
        monthlyLimit={MONTHLY_SCRAPE_LIMIT}
      />
    </>
  );
}
