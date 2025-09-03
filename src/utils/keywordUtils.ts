export interface KeywordCounts {
  newUniqueCount: number;
  existingCount: number;
  totalCount: number;
}

export interface KeywordSet {
  keywords: string[];
  existingProspectKeywords?: string[];
  setKeywords?: string[];
  otherKeywords?: string[];
  keywordEngagementCounts?: Record<string, number>;
}

export const MAX_KEYWORDS_PER_PROSPECT = 30;
export const POSTS_PER_KEYWORD = 100;

export function normalizeKeyword(keyword: string): string {
  return keyword.trim().toLowerCase();
}

export function calculateKeywordCounts(
  currentKeywords: string[],
  existingProspectKeywords: string[] = []
): KeywordCounts {
  const existingSet = new Set(
    existingProspectKeywords.map((k) => normalizeKeyword(k))
  );
  const newUniqueKeywords = currentKeywords.filter(
    (k) => !existingSet.has(normalizeKeyword(k))
  );
  
  return {
    newUniqueCount: newUniqueKeywords.length,
    existingCount: existingProspectKeywords.length,
    totalCount: existingProspectKeywords.length + newUniqueKeywords.length,
  };
}

export function isKeywordLimitExceeded(counts: KeywordCounts): boolean {
  return counts.totalCount > MAX_KEYWORDS_PER_PROSPECT;
}

export function getKeywordLimitMessage(counts: KeywordCounts): string {
  return `Cannot add more keywords. This prospect has ${counts.existingCount} existing keyword${
    counts.existingCount !== 1 ? "s" : ""
  } and would have ${counts.newUniqueCount} new keyword${
    counts.newUniqueCount !== 1 ? "s" : ""
  } (${counts.totalCount} total). Maximum allowed is ${MAX_KEYWORDS_PER_PROSPECT}.`;
}

export function combineKeywordSets(keywordSet: KeywordSet): string[] {
  const { keywords, setKeywords = [], otherKeywords = [] } = keywordSet;
  
  return [
    ...new Set([
      ...keywords,
      ...setKeywords,
      ...otherKeywords,
    ]),
  ];
}

export function hasProvenKeywords(
  setKeywords: string[] = [],
  keywordEngagementCounts: Record<string, number> = {}
): boolean {
  return (
    setKeywords.length > 0 &&
    setKeywords.some((k) => (keywordEngagementCounts[k] || 0) > 0)
  );
}

export function categorizeKeywords(
  allKeywords: string[],
  selectedKeywords: string[],
  provenKeywords: string[] = [],
  engagementCounts: Record<string, number> = {}
) {
  return allKeywords.map((keyword) => ({
    keyword,
    isSelected: selectedKeywords.includes(keyword),
    isProven: provenKeywords.includes(keyword),
    engagementCount: engagementCounts[keyword] || 0,
    hasEngagement: provenKeywords.includes(keyword) && (engagementCounts[keyword] || 0) > 0,
  }));
}