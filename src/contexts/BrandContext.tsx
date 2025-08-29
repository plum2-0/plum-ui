"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { Brand, RedditPostUI, UseCaseInsights } from "@/types/brand";
import { useBrandQuery } from "@/hooks/api/useBrandQuery";

interface ProspectDisplay {
  id: string;
  insights: UseCaseInsights | null;
  problem_to_solve: string;
  keywordCounts: { keyword: string; count: number }[];
  subredditCounts: { subreddit: string; count: number }[];
  pendingPosts: RedditPostUI[];
  actionedPosts: RedditPostUI[];
  uniquePendingAuthors: number;
  uniqueActionedAuthors: number;
  totalPotentialCustomers: number;
  totalKeywordCounts: number;
  totalPostsScraped: number;
  last_refresh_time?: string;
}

interface BrandContextType {
  brand: Brand | null;
  prospectsDisplay: ProspectDisplay[];
  totalPostsScraped: number;
  totalKeywordsCounts: number;
  postsToReview: RedditPostUI[];
  allActionedPosts: RedditPostUI[];
  brandAggregates: {
    uniquePendingAuthors: number;
    uniqueActionedAuthors: number;
    totalPotentialCustomers: number;
  };
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

    // Calculate keyword counts (include all prospect.keywords; zero if no hits)
    const keywordMap = new Map<string, number>();
    const allowedKeywords = new Set((prospect.keywords || []).filter(Boolean));
    // Initialize all prospect keywords with zero counts so they appear in the UI
    for (const keyword of allowedKeywords) {
      keywordMap.set(keyword, 0);
    }
    // Tally counts from filtered posts, restricted to prospect keywords
    filteredPosts.forEach((post) => {
      const sourceKeyword = post.source_keywords;
      if (sourceKeyword && allowedKeywords.has(sourceKeyword)) {
        const current = keywordMap.get(sourceKeyword) || 0;
        keywordMap.set(sourceKeyword, current + 1);
      }
    });
    const keywordCounts = Array.from(keywordMap.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count);

    const totalKeywordCounts = keywordCounts.reduce(
      (sum, item) => sum + item.count,
      0
    );

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
    const pendingPosts = filteredPosts
      .filter(
        (post) => post.status === "PENDING" || post.status === "SUGGESTED_REPLY"
      )
      .map((post) => {
        return {
          ...post,
          prospect_id: prospect.id,
        };
      })
      .sort((a, b) => {
        const aTime =
          (typeof a.created_utc === "number" ? a.created_utc * 1000 : 0) ||
          (a.insert_timestamp ? Date.parse(a.insert_timestamp) || 0 : 0);
        const bTime =
          (typeof b.created_utc === "number" ? b.created_utc * 1000 : 0) ||
          (b.insert_timestamp ? Date.parse(b.insert_timestamp) || 0 : 0);
        return bTime - aTime;
      });
    const actionedPosts = filteredPosts
      .filter((post) => post.status === "ACTIONED" || post.status === "REPLY")
      .map((post) => {
        return {
          ...post,
          prospect_id: prospect.id,
        };
      });

    // Calculate unique potential customers
    const pendingUniqueAuthors = new Set<string>();
    pendingPosts.forEach((post) => {
      if (post.author) {
        pendingUniqueAuthors.add(post.author);
      }
    });
    const actionedUniqueAuthors = new Set<string>();
    actionedPosts.forEach((post) => {
      if (post.author) {
        actionedUniqueAuthors.add(post.author);
      }
    });
    const totalPotentialCustomers = new Set<string>([
      ...pendingUniqueAuthors,
      ...actionedUniqueAuthors,
    ]).size;

    return {
      id: prospect.id,
      insights: prospect.insights,
      problem_to_solve: prospect.problem_to_solve,
      keywordCounts,
      subredditCounts,
      pendingPosts,
      actionedPosts,
      uniquePendingAuthors: pendingUniqueAuthors.size,
      uniqueActionedAuthors: actionedUniqueAuthors.size,
      totalPotentialCustomers,
      totalKeywordCounts,
      totalPostsScraped: prospect.total_posts_scraped || 0,
      last_refresh_time: prospect.last_refresh_time,
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

  const totalKeywordsCounts = useMemo(() => {
    if (!prospectsDisplay || prospectsDisplay.length === 0) return 0;
    return prospectsDisplay.reduce((total, prospect) => {
      return total + (prospect.totalKeywordCounts || 0);
    }, 0);
  }, [prospectsDisplay]);

  const postsToReview = useMemo<RedditPostUI[]>(() => {
    if (!prospectsDisplay || prospectsDisplay.length === 0) return [];
    return prospectsDisplay
      .flatMap((prospect) => prospect.pendingPosts || [])
      .sort((a, b) => {
        const aTime =
          (typeof a.created_utc === "number" ? a.created_utc * 1000 : 0) ||
          (a.insert_timestamp ? Date.parse(a.insert_timestamp) || 0 : 0);
        const bTime =
          (typeof b.created_utc === "number" ? b.created_utc * 1000 : 0) ||
          (b.insert_timestamp ? Date.parse(b.insert_timestamp) || 0 : 0);
        return bTime - aTime;
      });
  }, [prospectsDisplay]);

  const allActionedPosts = useMemo<RedditPostUI[]>(() => {
    if (!prospectsDisplay || prospectsDisplay.length === 0) return [];
    return prospectsDisplay.flatMap((prospect) => prospect.actionedPosts || []);
  }, [prospectsDisplay]);

  const brandAggregates = useMemo(() => {
    const pendingAuthors = new Set<string>();
    const actionedAuthors = new Set<string>();

    prospectsDisplay.forEach((prospect) => {
      (prospect.pendingPosts || []).forEach((post) => {
        if (post.author) pendingAuthors.add(post.author);
      });
      (prospect.actionedPosts || []).forEach((post) => {
        if (post.author) actionedAuthors.add(post.author);
      });
    });

    const totalPotentialCustomers = new Set<string>([
      ...pendingAuthors,
      ...actionedAuthors,
    ]).size;

    return {
      uniquePendingAuthors: pendingAuthors.size,
      uniqueActionedAuthors: actionedAuthors.size,
      totalPotentialCustomers,
    };
  }, [prospectsDisplay]);

  return (
    <BrandContext.Provider
      value={{
        brand: data?.brand || null,
        prospectsDisplay,
        totalPostsScraped,
        totalKeywordsCounts,
        postsToReview,
        allActionedPosts,
        brandAggregates,
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
