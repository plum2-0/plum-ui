"use client";

import { useState } from "react";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { useProspectRefreshPosts } from "@/hooks/api/useProspectRefreshPosts";
import { useKeywordQueue } from "@/contexts/KeywordQueueContext";
import { Brand, Prospect } from "@/types/brand";

interface FetchNewPostsButtonProps {
  selectedProspect: Prospect | null;
  brandId?: string;
  brandData?: Brand | null;
  onPostsRefreshed?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function FetchNewPostsButton({
  selectedProspect,
  brandId,
  brandData,
  onPostsRefreshed,
  size = "md",
  className,
}: FetchNewPostsButtonProps) {
  const refreshPosts = useProspectRefreshPosts();
  const { queuedKeywords, clearQueue, hasQueuedKeywords } = useKeywordQueue();

  const handleFetchNewPosts = async () => {
    if (!selectedProspect || !brandId || !brandData) return;

    // Combine existing keywords with queued keywords
    const combinedKeywords = [
      ...(selectedProspect.keywords || []),
      ...queuedKeywords,
    ];

    await refreshPosts.mutateAsync({
      brandId,
      prospectId: selectedProspect.id,
      brandName: brandData.name,
      brandOfferings: brandData.offerings,
      problemToSolve: selectedProspect.problem_to_solve,
      keywords: combinedKeywords,
    });

    // Clear the queue after successful submission
    clearQueue();

    // Call the callback if provided
    onPostsRefreshed?.();
  };

  const isDisabled =
    !selectedProspect || !brandId || !brandData || refreshPosts.isPending;

  return (
    <LiquidButton
      onClick={handleFetchNewPosts}
      disabled={isDisabled}
      variant="primary"
      size={size}
      shimmer={true}
      liquid={true}
      className={className}
    >
      <div className="flex items-center gap-2">
        {refreshPosts.isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>
              Wielding Power
              {hasQueuedKeywords && ` (${queuedKeywords.length} new)`}...
            </span>
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>
              Wield Power
              {hasQueuedKeywords && ` (${queuedKeywords.length} new)`}
            </span>
          </>
        )}
      </div>
    </LiquidButton>
  );
}
