"use client";

import { Prospect, Brand } from "@/types/brand";
import AllRedditPostsOverview from "./AllRedditPostsOverview";

interface CombinedResearchSummaryViewProps {
  prospects: Prospect[];
  brandId: string;
  brandData?: Brand | null;
}

export default function ResearchSummaryView({
  prospects,
}: CombinedResearchSummaryViewProps) {
  console.log("prospects", prospects);
  return (
    <div className="space-y-6 py-4">
      {/* Research Summary Section */}
      <div className="space-y-6">
        {/* Summary Header */}
        <div>
          <h2 className="text-white font-heading text-2xl font-bold mb-2 tracking-tight">
            All Prospects Summary
          </h2>
          <p className="text-white/80 font-body text-base leading-relaxed">
            Aggregated insights and research findings across {prospects.length}{" "}
            active prospect
            {prospects.length !== 1 ? "s" : ""} for your brand.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* Reddit Analytics Dashboard */}
        <AllRedditPostsOverview prospects={prospects} />

      </div>
    </div>
  );
}
