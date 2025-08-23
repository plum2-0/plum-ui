"use client";

import { Prospect } from "@/types/brand";
import ProspectsInsights from "./ProspectInsights";

interface ResearchViewProps {
  prospect: Prospect;
  brandId?: string;
}

export default function ResearchView({ prospect, brandId }: ResearchViewProps) {
  const posts = prospect.sourced_reddit_posts || [];

  return (
    <div className="space-y-6">
      {/* Research Section */}
      <div className="space-y-6">
        {/* Prospect Header */}
        <div>
          <p className="text-white/50 font-body text-sm mb-1 tracking-wide">
            Research Summary
          </p>
          {prospect.insights?.general_summary && (
            <p className="text-white font-bold font-body text-lg leading-relaxed">
              {prospect.insights.general_summary}
            </p>
          )}
        </div>

        {/* Research Insights */}
        <ProspectsInsights brandId={brandId || ""} />
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8"></div>
    </div>
  );
}
