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
  return (
    <div className="space-y-6 py-4">
      {/* Research Summary Section */}
      <div className="space-y-6">
        {/* Summary Header */}
        <div>
          <h2 className="heading-2 mb-2">All Prospects Summary</h2>
          <p className="body-lg">
            Aggregated insights and research findings across {prospects.length}{" "}
            active prospect
            {prospects.length !== 1 ? "s" : ""} for your brand.
          </p>
        </div>

        {/* Divider */}
        <div className="content-divider my-4"></div>

        {/* Reddit Analytics Dashboard */}
        <AllRedditPostsOverview prospects={prospects} />
      </div>
    </div>
  );
}
