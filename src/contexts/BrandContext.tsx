"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { Brand, RedditPost, UseCaseInsights } from "@/types/brand";
import { useBrandQuery } from "@/hooks/api/useBrandQuery";

interface ProspectDisplay {
  id: string;
  insights: UseCaseInsights | null;
  problem_to_solve: string;
  keywordCounts: { keyword: string; count: number }[];
  subredditCounts: { subreddit: string; count: number }[];
  pendingPosts: RedditPost[];
  actionedPosts: RedditPost[];
  totalPotentialCustomers: number;
}

interface BrandContextType {
  brand: Brand | null;
  prospectsDisplay: ProspectDisplay[];
  totalPostsScraped: number;
  allSourcedRedditPosts: RedditPost[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

function createProspectsDisplay(brand: Brand | null): ProspectDisplay[] {
  if (!brand || !brand.prospects) return [];

  return brand.prospects.map((prospect) => {
    // Filter out ignored posts
    const filteredPosts = (prospect.sourced_reddit_posts || []).filter(
      (post) => post.status !== "IGNORE"
    );

    // Calculate keyword counts
    const keywordMap = new Map<string, number>();
    filteredPosts.forEach((post) => {
      if (post.source_keywords) {
        const current = keywordMap.get(post.source_keywords) || 0;
        keywordMap.set(post.source_keywords, current + 1);
      }
    });
    const keywordCounts = Array.from(keywordMap.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate subreddit counts
    const subredditMap = new Map<string, number>();
    filteredPosts.forEach((post) => {
      if (post.subreddit) {
        const current = subredditMap.get(post.subreddit) || 0;
        subredditMap.set(post.subreddit, current + 1);
      }
    });
    const subredditCounts = Array.from(subredditMap.entries())
      .map(([subreddit, count]) => ({ subreddit, count }))
      .sort((a, b) => b.count - a.count);

    // Separate pending and actioned posts
    const pendingPosts = filteredPosts.filter(
      (post) => post.status === "PENDING" || post.status === "SUGGESTED_REPLY"
    );
    const actionedPosts = filteredPosts.filter(
      (post) => post.status === "ACTIONED" || post.status === "REPLY"
    );

    // Calculate unique potential customers
    const uniqueAuthors = new Set<string>();
    [...pendingPosts, ...actionedPosts].forEach((post) => {
      if (post.author) {
        uniqueAuthors.add(post.author);
      }
    });
    const totalPotentialCustomers = uniqueAuthors.size;

    return {
      id: prospect.id,
      insights: prospect.insights,
      problem_to_solve: prospect.problem_to_solve,
      keywordCounts,
      subredditCounts,
      pendingPosts,
      actionedPosts,
      totalPotentialCustomers,
    };
  });
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error, refetch } = useBrandQuery();

  const prospectsDisplay = useMemo(
    () => createProspectsDisplay(data?.brand || null),
    [data?.brand]
  );

  const totalPostsScraped = useMemo(() => {
    if (!data?.brand || !data.brand.prospects) return 0;

    return data.brand.prospects.reduce((total, prospect) => {
      return total + (prospect.total_posts_scraped || 0);
    }, 0);
  }, [data?.brand]);

  const allSourcedRedditPosts = useMemo<RedditPost[]>(() => {
    if (!data?.brand || !data.brand.prospects) return [];
    return data.brand.prospects.flatMap(
      (prospect) => prospect.sourced_reddit_posts || []
    );
  }, [data?.brand]);

  return (
    <BrandContext.Provider
      value={{
        brand: data?.brand || null,
        prospectsDisplay,
        totalPostsScraped,
        allSourcedRedditPosts,
        isLoading,
        error,
        refetch,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}
