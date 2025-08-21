import { useState } from "react";
import { Brand } from "@/types/brand";
import GlassPanel from "@/components/ui/GlassPanel";

interface MetricStateData {
  totalPotentialCustomers: number;
  totalCompetitorMentions: number;
  totalPosts: number;
}

interface BrandSummaryProps {
  brandData: Brand;
  metricState?: MetricStateData;
}

export default function BrandSummary({ brandData }: BrandSummaryProps) {
  const [isKeywordsExpanded, setIsKeywordsExpanded] = useState(false);

  // Aggregate all keywords from all prospects
  const allKeywords = brandData.prospects?.reduce((acc, prospect) => {
    return [...acc, ...(prospect.keywords || [])];
  }, [] as string[]);

  // Remove duplicates and count occurrences
  const keywordCounts = allKeywords?.reduce((acc, keyword) => {
    acc[keyword] = (acc[keyword] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort by count and get top keywords
  const sortedKeywords = Object.entries(keywordCounts || {})
    .sort((a, b) => b[1] - a[1])
    .map(([keyword]) => keyword);

  const visibleKeywords = isKeywordsExpanded
    ? sortedKeywords
    : sortedKeywords.slice(0, 5);
  const remainingCount = sortedKeywords.length - 5;
  return (
    <GlassPanel
      className="rounded-2xl p-6"
      variant="medium"
      style={{
        background:
          "linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
        backdropFilter: "blur(20px) saturate(1.2)",
        WebkitBackdropFilter: "blur(20px) saturate(1.2)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          {brandData.website ? (
            <a
              href={brandData.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block group"
            >
              <h1 className="text-white font-heading text-3xl font-bold mb-2 tracking-tight group-hover:text-blue-400 transition-colors flex items-center gap-2">
                {brandData.name}
                <svg
                  className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </h1>
            </a>
          ) : (
            <h1 className="text-white font-heading text-3xl font-bold mb-2 tracking-tight">
              {brandData.name}
            </h1>
          )}
          {brandData.detail && (
            <p className="text-white/80 font-body text-base leading-relaxed">
              {brandData.detail}
            </p>
          )}

          {/* Keywords Section */}
          {sortedKeywords.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-4 h-4 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span className="text-white/70 font-body text-sm font-medium">
                  Top Keywords:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="px-3 py-1 rounded-lg text-white/90 font-body text-sm"
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.08) 100%)",
                      border: "1px solid rgba(168, 85, 247, 0.2)",
                      boxShadow:
                        "0 2px 8px rgba(168, 85, 247, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    {keyword}
                  </span>
                ))}
                {!isKeywordsExpanded && remainingCount > 0 && (
                  <button
                    onClick={() => setIsKeywordsExpanded(true)}
                    className="px-3 py-1 rounded-lg text-purple-400 hover:text-purple-300 font-body text-sm transition-all duration-300 transform-gpu hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.04) 100%)",
                      border: "1px solid rgba(168, 85, 247, 0.2)",
                      boxShadow:
                        "0 2px 8px rgba(168, 85, 247, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
                      backdropFilter: "blur(10px)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(145deg, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)";
                      e.currentTarget.style.transform =
                        "scale(1.05) translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 0 rgba(0, 0, 0, 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(145deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.04) 100%)";
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(168, 85, 247, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)";
                    }}
                  >
                    +{remainingCount} More
                  </button>
                )}
                {isKeywordsExpanded && sortedKeywords.length > 5 && (
                  <button
                    onClick={() => setIsKeywordsExpanded(false)}
                    className="px-3 py-1 rounded-lg text-purple-400 hover:text-purple-300 font-body text-sm transition-all duration-300 transform-gpu hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.04) 100%)",
                      border: "1px solid rgba(168, 85, 247, 0.2)",
                      boxShadow:
                        "0 2px 8px rgba(168, 85, 247, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
                      backdropFilter: "blur(10px)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(145deg, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)";
                      e.currentTarget.style.transform =
                        "scale(1.05) translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 0 rgba(0, 0, 0, 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(145deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.04) 100%)";
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(168, 85, 247, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)";
                    }}
                  >
                    Show Less
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </GlassPanel>
  );
}
