import { RedditPost } from "@/types/brand";

export interface KeywordCountOptions {
  caseSensitive?: boolean;
  matchWholeWords?: boolean;
  fields?: Array<keyof Pick<RedditPost, "title" | "content">>;
}

const DEFAULT_OPTIONS: Required<KeywordCountOptions> = {
  caseSensitive: false,
  matchWholeWords: false,
  fields: ["title", "content"],
};

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildKeywordRegex(
  keyword: string,
  options: Required<KeywordCountOptions>
): RegExp {
  const trimmed = keyword.trim();
  const source = options.matchWholeWords
    ? `\\b${escapeRegExp(trimmed)}\\b`
    : escapeRegExp(trimmed);
  return new RegExp(source, options.caseSensitive ? "g" : "gi");
}

export function countKeywordsByPost(
  posts: RedditPost[],
  keywords: string[],
  options?: KeywordCountOptions
): Record<string, number> {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...(options || {}),
  } as Required<KeywordCountOptions>;

  const normalizedKeywords = Array.from(
    new Set(
      keywords
        .map((k) => k.trim())
        .filter(Boolean)
        .map((k) => (opts.caseSensitive ? k : k.toLowerCase()))
    )
  );

  const regexByKeyword = new Map<string, RegExp>();
  normalizedKeywords.forEach((kw) => {
    regexByKeyword.set(kw, buildKeywordRegex(kw, opts));
  });

  const counts: Record<string, number> = Object.fromEntries(
    normalizedKeywords.map((kw) => [kw, 0])
  );

  for (const post of posts) {
    const haystack = opts.fields
      .map((f) => (post[f] as string) || "")
      .join(" \n ");
    const haystackToSearch = opts.caseSensitive
      ? haystack
      : haystack.toLowerCase();

    for (const kw of normalizedKeywords) {
      const regex = regexByKeyword.get(kw)!;
      regex.lastIndex = 0;
      if (regex.test(haystackToSearch)) {
        counts[kw] += 1;
      }
    }
  }

  return counts;
}

export function getTopKeywordCounts(
  posts: RedditPost[],
  keywords: string[],
  limit = 10,
  options?: KeywordCountOptions
): Array<[string, number]> {
  const counts = countKeywordsByPost(posts, keywords, options);
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}
