"use client";

import { useMemo } from "react";
import { Prospect } from "@/types/brand";

interface AllRedditPostsOverviewProps {
  prospects: Prospect[];
}

export default function AllRedditPostsOverview({
  prospects,
}: AllRedditPostsOverviewProps) {
  // Aggregate all posts from all prospects
  const allPosts = useMemo(() => {
    const posts = prospects.flatMap((prospect) =>
      (prospect.sourced_reddit_posts || []).map((post) => ({
        ...post,
        prospectId: prospect.id,
        prospectName: prospect.problem_to_solve,
      }))
    );

    // Deduplicate based on thing_id
    const seenThingIds = new Set();
    const deduplicatedPosts = posts.filter((post) => {
      if (seenThingIds.has(post.thing_id)) {
        return false;
      }
      seenThingIds.add(post.thing_id);
      return true;
    });

    return deduplicatedPosts;
  }, [prospects]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = allPosts.length;
    const pending = allPosts.filter((p) => p.status === "PENDING").length;
    const approved = allPosts.filter((p) => p.status === "APPROVED").length;
    const rejected = allPosts.filter((p) => p.status === "REJECTED").length;

    return { total, pending, approved, rejected };
  }, [allPosts]);

  return (
    <div className="space-y-6">
      {/* Posts Header */}
      <div>
        <h3 className="text-white font-heading text-xl font-bold mb-2 tracking-tight">
          All Reddit Posts
        </h3>
        <p className="text-white/80 font-body text-base leading-relaxed">
          {stats.total} potential new leads collected
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-white/50 font-body text-xs mb-1">Total</p>
          <p className="text-white font-heading text-xl font-bold">
            {stats.total}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-amber-400/70 font-body text-xs mb-1">Pending</p>
          <p className="text-amber-400 font-heading text-xl font-bold">
            {stats.pending}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-emerald-400/70 font-body text-xs mb-1">Approved</p>
          <p className="text-emerald-400 font-heading text-xl font-bold">
            {stats.approved}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-rose-400/70 font-body text-xs mb-1">Rejected</p>
          <p className="text-rose-400 font-heading text-xl font-bold">
            {stats.rejected}
          </p>
        </div>
      </div>
    </div>
  );
}
