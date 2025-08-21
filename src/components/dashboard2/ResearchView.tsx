"use client";

import { Prospect } from "@/types/brand";
import UseCaseInsightsComponent from "./UseCaseInsights";

interface ResearchViewProps {
  prospect: Prospect;
}

export default function ResearchView({ prospect }: ResearchViewProps) {
  // Calculate prospect-specific statistics
  const posts = prospect.sourced_reddit_posts || [];

  const subCounts = posts.reduce<Record<string, number>>((acc, post) => {
    acc[post.subreddit] = (acc[post.subreddit] || 0) + 1;
    return acc;
  }, {});

  const topSubs = Object.entries(subCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Prospect Header */}
      <div>
        <p className="text-white/50 font-body text-sm mb-1 tracking-wide">
          Problem
        </p>
        {prospect.insights?.general_summary && (
          <p className="text-white font-bold font-body text-lg leading-relaxed">
            {prospect.insights.general_summary}
          </p>
        )}
      </div>

      {/* Research Insights */}
      <UseCaseInsightsComponent
        insights={prospect.insights}
        keywords={prospect.keywords || []}
        topSubreddits={topSubs}
      />
    </div>
  );
}
