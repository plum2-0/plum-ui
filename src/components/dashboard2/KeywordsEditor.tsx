"use client";

import { AnimatePresence } from "framer-motion";
import { GlassInput } from "@/components/ui/GlassInput";
import { useKeywordManagement } from "@/hooks/useKeywordManagement";
import {
  combineKeywordSets,
  hasProvenKeywords,
  MAX_KEYWORDS_PER_PROSPECT,
} from "@/utils/keywordUtils";
import KeywordTag from "./KeywordTag";
import QuickAddKeywordSection from "./QuickAddKeywordSection";

interface KeywordsEditorProps {
  keywords: string[];
  existingProspectKeywords?: string[];
  setKeywords?: string[];
  otherKeywords?: string[];
  keywordEngagementCounts?: Record<string, number>;
  onChange: (nextKeywords: string[]) => void;
}

export default function KeywordsEditor({
  keywords,
  existingProspectKeywords,
  setKeywords,
  otherKeywords,
  keywordEngagementCounts,
  onChange,
}: KeywordsEditorProps) {
  const {
    newKeywordInput,
    setNewKeywordInput,
    toggleKeyword,
    handleKeyboardInput,
    currentCounts,
  } = useKeywordManagement({
    keywords,
    existingProspectKeywords,
    onChange,
  });

  const allKeywords = combineKeywordSets({
    keywords,
    setKeywords,
    otherKeywords,
  });

  const provenKeywords = setKeywords || [];
  const showProvenKeywordsHelper = hasProvenKeywords(
    setKeywords,
    keywordEngagementCounts
  );
  const shouldShowQuickAdd =
    existingProspectKeywords &&
    existingProspectKeywords.length > 0 &&
    keywords.length === 0;

  return (
    <div className="space-y-3">
      <KeywordHeader
        currentCounts={currentCounts}
        existingProspectKeywords={existingProspectKeywords}
      />

      {showProvenKeywordsHelper && <ProvenKeywordsHelper />}

      <KeywordTagsList
        allKeywords={allKeywords}
        keywords={keywords}
        provenKeywords={provenKeywords}
        keywordEngagementCounts={keywordEngagementCounts}
        onToggleKeyword={toggleKeyword}
      />

      <GlassInput
        type="text"
        placeholder="Add New Keyword..."
        value={newKeywordInput}
        onChange={(e) => setNewKeywordInput(e.target.value)}
        onKeyDown={handleKeyboardInput}
        variant="ultra"
        shimmer={true}
        className="text-xs py-2"
      />

      {shouldShowQuickAdd && (
        <QuickAddKeywordSection
          existingProspectKeywords={existingProspectKeywords}
          setKeywords={setKeywords}
          keywordEngagementCounts={keywordEngagementCounts}
          onAddKeyword={toggleKeyword}
        />
      )}
    </div>
  );
}

interface KeywordHeaderProps {
  currentCounts: {
    newUniqueCount: number;
    existingCount: number;
    totalCount: number;
  };
  existingProspectKeywords?: string[];
}

function KeywordHeader({
  currentCounts,
  existingProspectKeywords,
}: KeywordHeaderProps) {
  const isOverLimit = currentCounts.totalCount > MAX_KEYWORDS_PER_PROSPECT;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-white/60">Keywords</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">
            {currentCounts.newUniqueCount} new
          </span>
          {existingProspectKeywords && existingProspectKeywords.length > 0 && (
            <>
              <span className="text-xs text-white/20">•</span>
              <span className="text-xs text-amber-400/60">
                {existingProspectKeywords.length} existing
              </span>
            </>
          )}
          <span className="text-xs text-white/20">•</span>
          <span
            className={`text-xs ${
              isOverLimit ? "text-red-400" : "text-white/40"
            }`}
          >
            {currentCounts.totalCount}/{MAX_KEYWORDS_PER_PROSPECT} total
          </span>
        </div>
      </div>
    </div>
  );
}

function ProvenKeywordsHelper() {
  return (
    <p className="text-[10px] text-emerald-400/60 mb-2">
      ✨ Keywords with green highlight are top performers from existing leads
    </p>
  );
}

interface KeywordTagsListProps {
  allKeywords: string[];
  keywords: string[];
  provenKeywords: string[];
  keywordEngagementCounts?: Record<string, number>;
  onToggleKeyword: (keyword: string) => void;
}

function KeywordTagsList({
  allKeywords,
  keywords,
  provenKeywords,
  keywordEngagementCounts = {},
  onToggleKeyword,
}: KeywordTagsListProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-3 max-h-32 overflow-y-auto">
      <AnimatePresence mode="popLayout">
        {allKeywords.map((keyword) => (
          <KeywordTag
            key={keyword}
            keyword={keyword}
            isSelected={keywords.includes(keyword)}
            isProven={provenKeywords.includes(keyword)}
            engagementCount={keywordEngagementCounts[keyword]}
            onClick={() => onToggleKeyword(keyword)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}