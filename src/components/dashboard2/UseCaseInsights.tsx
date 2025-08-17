"use client";

import GlassPills from "./GlassPills";
import SolutionsOpportunities from "./SolutionsOpportunities";

interface UseCaseInsightsProps {
  insights: any; // TODO: Add proper type for insights
}

export default function UseCaseInsightsComponent({
  insights,
}: UseCaseInsightsProps) {
  // Combine solutions and market opportunities
  const solutionsAndOpportunities = [
    ...(insights.identified_solutions || []),
    ...(insights.market_opportunities || []),
  ];

  return (
    <div className="border-t border-white/10">
      <div className="p-6 space-y-6">
        <h3 className="text-white font-heading text-xl font-bold">
          Market Insights
        </h3>

        {/* Solutions & Opportunities - Glass Cards Grid */}
        <SolutionsOpportunities items={solutionsAndOpportunities} />

        {/* Target Demographics - Using Standardized Component */}
        {insights.demographic_breakdown &&
          insights.demographic_breakdown.length > 0 && (
            <div>
              <h4 className="text-white/90 font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Target Demographics
              </h4>
              <GlassPills
                items={insights.demographic_breakdown.map((demo: string) => ({
                  label: demo,
                }))}
                variant="neutral"
                size="md"
                maxVisible={10}
                emptyText="No demographics data"
              />
            </div>
          )}

        {/* Competitors - Using Standardized Component */}
        {insights.top_competitors && insights.top_competitors.length > 0 && (
          <div>
            <h4 className="text-white/90 font-heading text-lg font-semibold mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-rose-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Top Competitors
            </h4>
            <GlassPills
              items={insights.top_competitors.map((competitor: string) => ({
                label: competitor,
              }))}
              variant="neutral"
              size="md"
              maxVisible={10}
              emptyText="No competitors identified"
            />
          </div>
        )}
      </div>
    </div>
  );
}
