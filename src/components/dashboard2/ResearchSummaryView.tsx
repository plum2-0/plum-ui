"use client";

import { Prospect } from "@/types/brand";
import OverviewInsights from "./OverviewInsights";

interface ResearchSummaryViewProps {
  prospects: Prospect[];
  brandId: string;
}

export default function ResearchSummaryView({
  prospects,
  brandId,
}: ResearchSummaryViewProps) {

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div>
        <p className="text-white/50 font-body text-sm mb-1 tracking-wide">
          Brand Overview
        </p>
        <h2 className="text-white font-heading text-2xl font-bold mb-2 tracking-tight">
          All Prospects Summary
        </h2>
        <p className="text-white/80 font-body text-base leading-relaxed">
          Aggregated insights and research findings across {prospects.length} active prospect
          {prospects.length !== 1 ? "s" : ""} for your brand.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      {/* Overview Insights Component */}
      <OverviewInsights
        prospects={prospects}
        brandId={brandId}
      />
    </div>
  );
}