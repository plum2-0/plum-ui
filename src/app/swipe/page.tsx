"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SwipeableProspectModal from "@/components/dashboard2/SwipeableProspectModal";
import { useBrandQuery } from "@/hooks/api/useBrandQuery";
import { RedditPost } from "@/types/brand";

// Union type combining RedditPost with prospect_id
export type RedditPostWithProspect = RedditPost & {
  prospect_id: string;
};

export default function SwipePage() {
  useSession();
  const router = useRouter();
  const { data: brandResponse, isLoading, error } = useBrandQuery();
  const [posts, setPosts] = useState<RedditPostWithProspect[]>([]);

  const brandData = brandResponse?.brand || null;

  useEffect(() => {
    if (brandData?.prospects) {
      // Flatten all posts and attach prospect_id to each post
      const allPosts: RedditPostWithProspect[] = brandData.prospects.flatMap(
        (prospect) =>
          prospect.sourced_reddit_posts
            .filter((post) => post.status === "PENDING")
            .map((post) => ({
              ...post,
              prospect_id: prospect.id,
            }))
      );
      setPosts(allPosts);
    }
  }, [brandData]);

  const handleStackCompleted = () => {
    // Navigate back to dashboard when all posts are reviewed
    router.push("/dashboard");
  };

  const handleClose = () => {
    // Navigate back to dashboard when user closes
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-pulse text-white text-xl font-body">
          Loading swipe cards...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-red-300 text-xl font-body">
          Error: {error.message}
        </div>
      </div>
    );
  }

  if (!brandData) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white text-xl font-body">No brand data found</div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="text-white text-xl font-body mb-4">
            No pending posts to review
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Get the first prospect for prospectId (or use a default)
  const firstProspect = brandData.prospects[0];
  const prospectId = firstProspect?.id || "default";
  const problemToSolve = firstProspect?.problem_to_solve;

  return (
    <div className="min-h-screen bg-black">
      <SwipeableProspectModal
        isOpen={true}
        posts={posts}
        brandId={brandData.id}
        brandName={brandData.name}
        brandDetail={brandData.detail || undefined}
        prospectId={prospectId}
        problemToSolve={problemToSolve}
        onClose={handleClose}
        onStackCompleted={handleStackCompleted}
        standalone={true}
      />
    </div>
  );
}
