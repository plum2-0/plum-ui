import GlassPanel from "@/components/ui/GlassPanel";
import ProspectSelector from "./ProspectSelector";
import KeywordDisplay from "./KeywordDisplay";
import SubredditsSection from "./SubredditsSection";
import FetchNewPostsButton from "./FetchNewPostsButton";
import { useProspect } from "@/contexts/ProspectContext";
import { useKeywordQueue } from "@/contexts/KeywordQueueContext";
import { useBrand } from "@/contexts/BrandContext";
import ProspectTargetStat from "./ProspectTargetsStat";

export default function BrandSummary() {
  const { brand: brandData } = useBrand();
  const { selectedProspect } = useProspect();
  const { queuedKeywords, hasQueuedKeywords } = useKeywordQueue();

  if (!brandData) return null;

  const brandId = brandData.id;
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

          <div className="space-y-6">
            {/* Prospect Selector */}
            {brandData.prospects && brandData.prospects.length > 0 && (
              <div>
                <p className="text-white/70 font-body text-sm mb-2">
                  Researching Problems
                </p>
                <ProspectSelector
                  prospects={brandData.prospects}
                  placeholder="Summary - All Prospects"
                />
              </div>
            )}

            <ProspectTargetStat
              brandId={brandId}
              posts={brandData.prospects.flatMap(
                (prospect) => prospect.sourced_reddit_posts || []
              )}
              prospectId={"overview stat"} // Use first prospect or overview as fallback
              problemToSolve="Overview - All Use Cases"
              onStackCompleted={() => {
                console.log("All prospects reviewed!");
                // TODO: Show completion message or refresh data
              }}
            />

            {/* Keywords Section */}
            <KeywordDisplay brandData={brandData} />

            {/* Subreddits Section */}
            <SubredditsSection brandData={brandData} />
          </div>
        </div>
      </div>

      {/* Power Wielding Section */}
      <div
        className="mt-6 space-y-4 relative transition-all duration-700 rounded-2xl"
        style={{
          background: hasQueuedKeywords
            ? "linear-gradient(145deg, rgba(34, 197, 94, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%)"
            : "transparent",
          padding: hasQueuedKeywords ? "16px" : "0",
          border: hasQueuedKeywords
            ? "1px solid rgba(34, 197, 94, 0.2)"
            : "1px solid transparent",
          boxShadow: hasQueuedKeywords
            ? "0 8px 32px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            : "none",
          animation: "none",
        }}
      >
        {hasQueuedKeywords && (
          <style jsx>{`
            @keyframes shimmer {
              0% {
                background-position: -200% center;
              }
              100% {
                background-position: 200% center;
              }
            }
          `}</style>
        )}

        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4"></div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3
              className="text-white font-heading text-lg font-bold flex items-center gap-2"
              style={{
                textShadow: hasQueuedKeywords
                  ? "0 0 20px rgba(34, 197, 94, 0.5)"
                  : "none",
                transition: "all 0.5s ease",
              }}
            >
              <span
                className={`transition-all duration-500 ${
                  hasQueuedKeywords ? "text-emerald-400" : "text-white"
                }`}
                style={{
                  filter: hasQueuedKeywords ? "brightness(1.2)" : "none",
                }}
              >
                ⚡
              </span>
              <span
                className="transition-all duration-500"
                style={{
                  background: hasQueuedKeywords
                    ? "linear-gradient(90deg, #22c55e, #a855f7, #22c55e)"
                    : "none",
                  backgroundSize: hasQueuedKeywords ? "200% auto" : "auto",
                  WebkitBackgroundClip: hasQueuedKeywords ? "text" : "unset",
                  WebkitTextFillColor: hasQueuedKeywords
                    ? "transparent"
                    : "white",
                  animation: hasQueuedKeywords
                    ? "shimmer 3s linear infinite"
                    : "none",
                }}
              >
                Content Discovery Engine
              </span>
              {hasQueuedKeywords && (
                <span
                  className="ml-2 px-3 py-1 text-xs font-normal rounded-full"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.15) 100%)",
                    border: "1px solid rgba(34, 197, 94, 0.4)",
                    color: "#86efac",
                    boxShadow:
                      "0 2px 8px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {queuedKeywords.length} new keyword
                  {queuedKeywords.length !== 1 ? "s" : ""} ready
                </span>
              )}
            </h3>
            <p
              className="text-white/70 font-body text-sm transition-all duration-500"
              style={{
                color: hasQueuedKeywords
                  ? "#86efac"
                  : "rgba(255, 255, 255, 0.7)",
                textShadow: hasQueuedKeywords
                  ? "0 0 10px rgba(34, 197, 94, 0.3)"
                  : "none",
              }}
            >
              {hasQueuedKeywords
                ? `🚀 Ready to discover with ${
                    queuedKeywords.length
                  } new keyword${queuedKeywords.length !== 1 ? "s" : ""}`
                : "Harness AI to discover fresh opportunities in the digital realm"}
            </p>
          </div>

          <div
            className="transition-all duration-500"
            style={{
              filter: hasQueuedKeywords
                ? "drop-shadow(0 0 20px rgba(34, 197, 94, 0.4))"
                : "none",
              transform: hasQueuedKeywords ? "scale(1.05)" : "scale(1)",
            }}
          >
            <FetchNewPostsButton
              selectedProspect={selectedProspect}
              brandId={brandId}
              brandData={brandData}
              size="md"
              className="ml-4"
            />
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
