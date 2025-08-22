"use client";

import { Prospect } from "@/types/brand";
import UseCaseInsightsComponent from "./UseCaseInsights";

interface CombinedResearchViewProps {
  prospect: Prospect;
  brandId?: string;
  brandData?: any;
}

export default function CombinedResearchView({
  prospect,
  brandId,
  brandData,
}: CombinedResearchViewProps) {
  // Get posts for this prospect
  const posts = prospect.sourced_reddit_posts || [];

  return (
    <div className="space-y-6">
      {/* Research Section */}
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
          posts={posts}
          brandId={brandId}
          prospectId={prospect.id}
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8"></div>
    </div>
  );
}
