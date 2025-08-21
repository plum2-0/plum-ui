"use client";

import { useState } from "react";
import { useProspect } from "@/contexts/ProspectContext";
import { useKeywordQueue } from "@/contexts/KeywordQueueContext";
import { Brand } from "@/types/brand";

interface KeywordDisplayProps {
  brandData: Brand;
}

export default function KeywordDisplay({ brandData }: KeywordDisplayProps) {
  const { selectedProspect } = useProspect();
  const { queuedKeywords, addKeyword, removeKeyword, hasQueuedKeywords } = useKeywordQueue();
  const [isKeywordsExpanded, setIsKeywordsExpanded] = useState(false);
  const [isAddingKeyword, setIsAddingKeyword] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

  // Get keywords based on selected prospect or all prospects
  const getKeywords = () => {
    if (selectedProspect) {
      // Return keywords for the selected prospect
      return selectedProspect.keywords || [];
    } else {
      // Aggregate all keywords from all prospects
      const allKeywords = brandData.prospects?.reduce((acc, prospect) => {
        return [...acc, ...(prospect.keywords || [])];
      }, [] as string[]);
      return allKeywords || [];
    }
  };

  const keywords = getKeywords();
  const allKeywords = [...keywords, ...queuedKeywords];

  // Remove duplicates and count occurrences
  const keywordCounts = allKeywords.reduce((acc, keyword) => {
    acc[keyword] = (acc[keyword] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort by count and get top keywords
  const sortedKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([keyword]) => keyword);

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      addKeyword(newKeyword);
      setNewKeyword("");
      setIsAddingKeyword(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddKeyword();
    } else if (e.key === "Escape") {
      setIsAddingKeyword(false);
      setNewKeyword("");
    }
  };

  const visibleKeywords = isKeywordsExpanded
    ? sortedKeywords
    : sortedKeywords.slice(0, 5);
  const remainingCount = sortedKeywords.length - 5;

  // Don't render if no keywords
  if (sortedKeywords.length === 0) {
    return null;
  }

  return (
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
          {selectedProspect ? "Problem Keywords:" : "Top Keywords:"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {visibleKeywords.map((keyword) => {
          const isQueued = queuedKeywords.includes(keyword);
          return (
            <span
              key={keyword}
              className={`px-3 py-1 rounded-lg text-white/90 font-body text-sm flex items-center gap-2 transition-all duration-500 ${
                isQueued ? "transform scale-105" : ""
              }`}
              style={{
                background: isQueued
                  ? "linear-gradient(145deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.15) 100%)"
                  : "linear-gradient(145deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.08) 100%)",
                border: isQueued
                  ? "1px solid rgba(34, 197, 94, 0.4)"
                  : "1px solid rgba(168, 85, 247, 0.2)",
                boxShadow: isQueued
                  ? "0 4px 16px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 20px rgba(34, 197, 94, 0.2)"
                  : "0 2px 8px rgba(168, 85, 247, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
                backdropFilter: "blur(10px)",
              }}
            >
              {keyword}
              {isQueued && (
                <button
                  onClick={() => removeKeyword(keyword)}
                  className="ml-1 hover:text-red-400 transition-colors"
                  title="Remove from queue"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </span>
          );
        })}
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
              e.currentTarget.style.transform = "scale(1.05) translateY(-1px)";
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
              e.currentTarget.style.transform = "scale(1.05) translateY(-1px)";
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

        {/* Add keyword input */}
        {isAddingKeyword ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter keyword..."
              className="px-4 py-2 rounded-lg text-white placeholder-white/40 font-body text-sm focus:outline-none transition-all duration-300"
              style={{
                background: "linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                boxShadow: "0 2px 8px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid rgba(168, 85, 247, 0.5)";
                e.target.style.boxShadow = "0 4px 12px rgba(168, 85, 247, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(168, 85, 247, 0.3)";
                e.target.style.boxShadow = "0 2px 8px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
              }}
              autoFocus
            />
            <button
              onClick={handleAddKeyword}
              className="px-4 py-2 rounded-lg text-white font-body text-sm transition-all duration-300 transform hover:scale-105"
              style={{
                background: "linear-gradient(145deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.2) 100%)",
                border: "1px solid rgba(34, 197, 94, 0.4)",
                boxShadow: "0 2px 8px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(145deg, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.3) 100%)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(145deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.2) 100%)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)";
              }}
            >
              ✨ Add
            </button>
            <button
              onClick={() => {
                setIsAddingKeyword(false);
                setNewKeyword("");
              }}
              className="px-4 py-2 rounded-lg text-white/60 hover:text-white/80 font-body text-sm transition-all duration-300"
              style={{
                background: "linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingKeyword(true)}
            className="px-3 py-1 rounded-lg text-purple-400 hover:text-purple-300 font-body text-sm transition-all duration-300 transform-gpu hover:scale-105 flex items-center gap-1"
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
              e.currentTarget.style.transform = "scale(1.05) translateY(-1px)";
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
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Keyword
          </button>
        )}
      </div>
    </div>
  );
}
