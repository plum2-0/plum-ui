"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface KeywordQueueContextType {
  queuedKeywords: string[];
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  clearQueue: () => void;
  hasQueuedKeywords: boolean;
}

const KeywordQueueContext = createContext<KeywordQueueContextType | undefined>(
  undefined
);

export function KeywordQueueProvider({ children }: { children: ReactNode }) {
  const [queuedKeywords, setQueuedKeywords] = useState<string[]>([]);

  const addKeyword = (keyword: string) => {
    const trimmedKeyword = keyword.trim().toLowerCase();
    if (trimmedKeyword && !queuedKeywords.includes(trimmedKeyword)) {
      setQueuedKeywords((prev) => [...prev, trimmedKeyword]);
    }
  };

  const removeKeyword = (keyword: string) => {
    setQueuedKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  const clearQueue = () => {
    setQueuedKeywords([]);
  };

  const hasQueuedKeywords = queuedKeywords.length > 0;

  return (
    <KeywordQueueContext.Provider
      value={{
        queuedKeywords,
        addKeyword,
        removeKeyword,
        clearQueue,
        hasQueuedKeywords,
      }}
    >
      {children}
    </KeywordQueueContext.Provider>
  );
}

export function useKeywordQueue() {
  const context = useContext(KeywordQueueContext);
  if (context === undefined) {
    throw new Error(
      "useKeywordQueue must be used within a KeywordQueueProvider"
    );
  }
  return context;
}