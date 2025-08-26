"use client";

import FetchNewPostsButton from "./FetchNewPostsButton";
import { useKeywordQueue } from "@/contexts/KeywordQueueContext";
import { Brand } from "@/types/brand";

interface ContentDiscoveryEngineSectionProps {
  brandId: string;
  brandData: Brand;
}

export default function ContentDiscoveryEngineSection({
  brandId,
  brandData,
}: ContentDiscoveryEngineSectionProps) {
  const { queuedKeywords, hasQueuedKeywords } = useKeywordQueue();

  return (
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
              color: hasQueuedKeywords ? "#86efac" : "rgba(255, 255, 255, 0.7)",
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
            selectedProspect={null}
            brandId={brandId}
            brandData={brandData}
            size="md"
            className="ml-4"
          />
        </div>
      </div>
    </div>
  );
}
