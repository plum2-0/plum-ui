"use client";

import { useState } from "react";
import { useProspect } from "@/contexts/ProspectContext";
import { Brand } from "@/types/brand";

interface SubredditsSectionProps {
  brandData: Brand;
}

export default function SubredditsSection({
  brandData,
}: SubredditsSectionProps) {
  const { selectedProspect } = useProspect();
  const [isSubredditsExpanded, setIsSubredditsExpanded] = useState(false);

  // Get subreddit data based on selected prospect or all prospects
  const getSubreddits = () => {
    if (selectedProspect) {
      // Return subreddits for the selected prospect
      const posts = selectedProspect.sourced_reddit_posts || [];
      return posts.map((post) => post.subreddit);
    } else {
      // Aggregate all subreddits from all prospects
      const allSubreddits = brandData.prospects?.reduce((acc, prospect) => {
        const posts = prospect.sourced_reddit_posts || [];
        const subreddits = posts.map((post) => post.subreddit);
        return [...acc, ...subreddits];
      }, [] as string[]);
      return allSubreddits || [];
    }
  };

  const subreddits = getSubreddits();

  // Count subreddit occurrences
  const subredditCounts = subreddits.reduce((acc, subreddit) => {
    acc[subreddit] = (acc[subreddit] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort by count and get top subreddits
  const sortedSubreddits = Object.entries(subredditCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Limit to top 10

  const visibleSubreddits = isSubredditsExpanded
    ? sortedSubreddits
    : sortedSubreddits.slice(0, 5);
  const remainingCount = sortedSubreddits.length - 5;

  // Don't render if no subreddits
  if (sortedSubreddits.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="w-4 h-4 text-orange-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
        <span className="text-white/70 font-body text-sm font-medium">
          {selectedProspect ? "Active Subreddits:" : "Top Subreddits:"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {visibleSubreddits.map(([subreddit, count]) => (
          <span
            key={subreddit}
            className="px-3 py-1 rounded-lg text-white/90 font-body text-sm flex items-center gap-2"
            style={{
              background:
                "linear-gradient(145deg, rgba(251, 146, 60, 0.15) 0%, rgba(251, 146, 60, 0.08) 100%)",
              border: "1px solid rgba(251, 146, 60, 0.2)",
              boxShadow:
                "0 2px 8px rgba(251, 146, 60, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span>r/{subreddit}</span>
          </span>
        ))}
        {!isSubredditsExpanded && remainingCount > 0 && (
          <button
            onClick={() => setIsSubredditsExpanded(true)}
            className="px-3 py-1 rounded-lg text-orange-400 hover:text-orange-300 font-body text-sm transition-all duration-300 transform-gpu hover:scale-105"
            style={{
              background:
                "linear-gradient(145deg, rgba(251, 146, 60, 0.08) 0%, rgba(251, 146, 60, 0.04) 100%)",
              border: "1px solid rgba(251, 146, 60, 0.2)",
              boxShadow:
                "0 2px 8px rgba(251, 146, 60, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
              backdropFilter: "blur(10px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(145deg, rgba(251, 146, 60, 0.12) 0%, rgba(251, 146, 60, 0.08) 100%)";
              e.currentTarget.style.transform = "scale(1.05) translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(251, 146, 60, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 0 rgba(0, 0, 0, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(145deg, rgba(251, 146, 60, 0.08) 0%, rgba(251, 146, 60, 0.04) 100%)";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(251, 146, 60, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)";
            }}
          >
            +{remainingCount} More
          </button>
        )}
        {isSubredditsExpanded && sortedSubreddits.length > 5 && (
          <button
            onClick={() => setIsSubredditsExpanded(false)}
            className="px-3 py-1 rounded-lg text-orange-400 hover:text-orange-300 font-body text-sm transition-all duration-300 transform-gpu hover:scale-105"
            style={{
              background:
                "linear-gradient(145deg, rgba(251, 146, 60, 0.08) 0%, rgba(251, 146, 60, 0.04) 100%)",
              border: "1px solid rgba(251, 146, 60, 0.2)",
              boxShadow:
                "0 2px 8px rgba(251, 146, 60, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
              backdropFilter: "blur(10px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(145deg, rgba(251, 146, 60, 0.12) 0%, rgba(251, 146, 60, 0.08) 100%)";
              e.currentTarget.style.transform = "scale(1.05) translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(251, 146, 60, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 0 rgba(0, 0, 0, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(145deg, rgba(251, 146, 60, 0.08) 0%, rgba(251, 146, 60, 0.04) 100%)";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(251, 146, 60, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)";
            }}
          >
            Show Less
          </button>
        )}
      </div>
    </div>
  );
}
