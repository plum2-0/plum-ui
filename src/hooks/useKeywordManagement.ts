import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";

export const MAX_KEYWORDS_PER_PROSPECT = 30;
export const POSTS_PER_KEYWORD = 100;

interface UseKeywordManagementProps {
  keywords: string[];
  existingProspectKeywords?: string[];
  onChange: (keywords: string[]) => void;
}

interface KeywordValidation {
  isValid: boolean;
  errorMessage?: string;
  newUniqueCount: number;
  existingCount: number;
  totalCount: number;
}

export function useKeywordManagement({
  keywords,
  existingProspectKeywords = [],
  onChange,
}: UseKeywordManagementProps) {
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const { showToast } = useToast();

  const normalizeKeyword = useCallback((keyword: string): string => {
    return keyword.trim().toLowerCase();
  }, []);

  const calculateKeywordCounts = useCallback(
    (currentKeywords: string[]) => {
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
    },
    [existingProspectKeywords, normalizeKeyword]
  );

  const validateKeywordAddition = useCallback(
    (keywordToAdd: string, currentKeywords: string[]): KeywordValidation => {
      const normalized = normalizeKeyword(keywordToAdd);
      
      if (!normalized) {
        return {
          isValid: false,
          errorMessage: "Keyword cannot be empty",
          ...calculateKeywordCounts(currentKeywords),
        };
      }

      if (currentKeywords.includes(normalized)) {
        return {
          isValid: false,
          errorMessage: "Keyword already exists",
          ...calculateKeywordCounts(currentKeywords),
        };
      }

      const potentialKeywords = [...currentKeywords, normalized];
      const counts = calculateKeywordCounts(potentialKeywords);

      if (counts.totalCount > MAX_KEYWORDS_PER_PROSPECT) {
        return {
          isValid: false,
          errorMessage: `Cannot add more keywords. This prospect has ${counts.existingCount} existing keyword${
            counts.existingCount !== 1 ? "s" : ""
          } and would have ${counts.newUniqueCount} new keyword${
            counts.newUniqueCount !== 1 ? "s" : ""
          } (${counts.totalCount} total). Maximum allowed is ${MAX_KEYWORDS_PER_PROSPECT}.`,
          ...counts,
        };
      }

      return {
        isValid: true,
        ...counts,
      };
    },
    [calculateKeywordCounts, normalizeKeyword]
  );

  const addKeyword = useCallback(
    (keyword: string) => {
      const validation = validateKeywordAddition(keyword, keywords);
      
      if (!validation.isValid) {
        if (validation.errorMessage && validation.errorMessage !== "Keyword already exists") {
          showToast({
            type: "error",
            message: validation.errorMessage,
            duration: 5000,
          });
        }
        return false;
      }

      onChange([...keywords, normalizeKeyword(keyword)]);
      return true;
    },
    [keywords, onChange, validateKeywordAddition, normalizeKeyword, showToast]
  );

  const removeKeyword = useCallback(
    (keyword: string) => {
      onChange(keywords.filter((k) => k !== keyword));
    },
    [keywords, onChange]
  );

  const toggleKeyword = useCallback(
    (keyword: string) => {
      if (keywords.includes(keyword)) {
        removeKeyword(keyword);
      } else {
        addKeyword(keyword);
      }
    },
    [keywords, addKeyword, removeKeyword]
  );

  const handleKeyboardInput = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && newKeywordInput.trim()) {
        e.preventDefault();
        if (addKeyword(newKeywordInput)) {
          setNewKeywordInput("");
        }
      }
    },
    [newKeywordInput, addKeyword]
  );

  const currentCounts = calculateKeywordCounts(keywords);

  return {
    newKeywordInput,
    setNewKeywordInput,
    toggleKeyword,
    handleKeyboardInput,
    currentCounts,
  };
}