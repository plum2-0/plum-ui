"use client";

import { motion } from "framer-motion";

interface QuickAddKeywordSectionProps {
  existingProspectKeywords: string[];
  setKeywords?: string[];
  keywordEngagementCounts?: Record<string, number>;
  onAddKeyword: (keyword: string) => void;
}

export default function QuickAddKeywordSection({
  existingProspectKeywords,
  setKeywords = [],
  keywordEngagementCounts = {},
  onAddKeyword,
}: QuickAddKeywordSectionProps) {
  const provenKeywordsWithEngagement = setKeywords.filter(
    (keyword) => (keywordEngagementCounts[keyword] || 0) > 0
  );
  
  const otherExistingKeywords = existingProspectKeywords.filter(
    (keyword) => {
      const engagementCount = keywordEngagementCounts[keyword] || 0;
      const isProven = setKeywords.includes(keyword) && engagementCount > 0;
      return !isProven;
    }
  );

  if (existingProspectKeywords.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <label className="text-xs text-white/40 block mb-2">
        Quick add from existing keywords:
      </label>
      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
        {provenKeywordsWithEngagement.map((keyword) => {
          const engagementCount = keywordEngagementCounts[keyword] || 0;
          
          return (
            <motion.button
              key={keyword}
              onClick={() => onAddKeyword(keyword)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-2.5 py-1 text-xs rounded-full cursor-pointer transition-all bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300/70"
              style={{
                boxShadow: "0 0 8px rgba(34, 197, 94, 0.2)",
              }}
            >
              <span className="flex items-center gap-1">
                ✨ {keyword}
                <span className="text-[10px] opacity-60">
                  ({engagementCount})
                </span>
                <span className="text-white/40">+</span>
              </span>
            </motion.button>
          );
        })}

        {otherExistingKeywords.map((keyword) => (
          <motion.button
            key={keyword}
            onClick={() => onAddKeyword(keyword)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-2.5 py-1 text-xs rounded-full cursor-pointer transition-all bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400/60"
            style={{
              boxShadow: "0 0 8px rgba(251, 191, 36, 0.15)",
            }}
          >
            <span className="flex items-center gap-1">
              {keyword}
              <span className="text-white/40">+</span>
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}