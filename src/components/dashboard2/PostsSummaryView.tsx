"use client";

import { useState, useMemo } from "react";
import { Prospect, Brand } from "@/types/brand";
import GlassPanel from "@/components/ui/GlassPanel";
import { RedditPostCard } from "../reddit/RedditPostCard";

interface PostsSummaryViewProps {
  prospects: Prospect[];
  brandId: string;
  brandData?: Brand | null;
}

export default function PostsSummaryView({
  prospects,
  brandId,
  brandData,
}: PostsSummaryViewProps) {
  const [filterProspect, setFilterProspect] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "prospect">("date");

  // Aggregate all posts from all prospects
  const allPosts = useMemo(() => {
    const posts = prospects.flatMap((prospect) =>
      (prospect.sourced_reddit_posts || []).map((post) => ({
        ...post,
        prospectId: prospect.id,
        prospectName: prospect.problem_to_solve,
      }))
    );

    // Sort posts
    if (sortBy === "date") {
      posts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      posts.sort((a, b) => a.prospectName.localeCompare(b.prospectName));
    }

    return posts;
  }, [prospects, sortBy]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    let posts = allPosts;

    if (filterProspect !== "all") {
      posts = posts.filter((post) => post.prospectId === filterProspect);
    }

    if (filterStatus !== "all") {
      posts = posts.filter((post) => post.status === filterStatus);
    }

    return posts;
  }, [allPosts, filterProspect, filterStatus]);

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
      {/* Summary Header */}
      <div>
        <p className="text-white/50 font-body text-sm mb-1 tracking-wide">
          Posts Overview
        </p>
        <h2 className="text-white font-heading text-2xl font-bold mb-2 tracking-tight">
          All Reddit Posts
        </h2>
        <p className="text-white/80 font-body text-base leading-relaxed">
          {stats.total} posts collected across {prospects.length} prospect
          {prospects.length !== 1 ? "s" : ""}
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Prospect Filter */}
        <select
          value={filterProspect}
          onChange={(e) => setFilterProspect(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-body text-sm focus:outline-none focus:border-purple-400/50"
        >
          <option value="all">All Prospects</option>
          {prospects.map((prospect) => (
            <option key={prospect.id} value={prospect.id}>
              {prospect.problem_to_solve}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-body text-sm focus:outline-none focus:border-purple-400/50"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "date" | "prospect")}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-body text-sm focus:outline-none focus:border-purple-400/50"
        >
          <option value="date">Sort by Date</option>
          <option value="prospect">Sort by Prospect</option>
        </select>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div key={post.id} className="space-y-2">
              {/* Prospect Label */}
              <div className="flex items-center gap-2">
                <span className="text-white/50 font-body text-xs">
                  From prospect:
                </span>
                <span className="text-white/70 font-body text-xs font-medium">
                  {post.prospectName}
                </span>
              </div>
              <RedditPostCard
                post={post}
                prospectId={post.prospectId}
                brandId={brandId}
                brandData={brandData}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-white/50 font-body">
              No posts found matching your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}