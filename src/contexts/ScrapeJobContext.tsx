"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface ScrapeJob {
  prospectId: string;
  brandName: string;
  problemToSolve: string;
  keywords: string[]; // New keywords to add
  existingProspectKeywords?: string[]; // Current keywords already on the prospect
  setKeywords?: string[]; // Keywords with proven engagement (for display)
  otherKeywords?: string[]; // Additional available keywords (for display)
  keywordEngagementCounts?: Record<string, number>; // Engagement counts for display
  numPosts: number;
}

interface ScrapeJobContextType {
  isOpen: boolean;
  scrapeJobs: Map<string, ScrapeJob>;
  addScrapeJob: (job: ScrapeJob) => void;
  updateScrapeJob: (prospectId: string, updates: Partial<ScrapeJob>) => void;
  removeScrapeJob: (prospectId: string) => void;
  clearAll: () => void;
  openDrawer: (initialJobs?: ScrapeJob[]) => void;
  closeDrawer: () => void;
  closeDrawerAndClear: () => void;
  getTotalPostsCount: () => number;
}

const ScrapeJobContext = createContext<ScrapeJobContextType | undefined>(undefined);

export function ScrapeJobProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrapeJobs, setScrapeJobs] = useState<Map<string, ScrapeJob>>(new Map());

  const addScrapeJob = useCallback((job: ScrapeJob) => {
    setScrapeJobs((prev) => {
      const newMap = new Map(prev);
      newMap.set(job.prospectId, job);
      return newMap;
    });
  }, []);

  const updateScrapeJob = useCallback((prospectId: string, updates: Partial<ScrapeJob>) => {
    setScrapeJobs((prev) => {
      const newMap = new Map(prev);
      const existingJob = newMap.get(prospectId);
      if (existingJob) {
        newMap.set(prospectId, { ...existingJob, ...updates });
      }
      return newMap;
    });
  }, []);

  const removeScrapeJob = useCallback((prospectId: string) => {
    setScrapeJobs((prev) => {
      const newMap = new Map(prev);
      newMap.delete(prospectId);
      return newMap;
    });
  }, []);

  const clearAll = useCallback(() => {
    setScrapeJobs(new Map());
  }, []);

  const openDrawer = useCallback((initialJobs?: ScrapeJob[]) => {
    if (initialJobs && initialJobs.length > 0) {
      const jobsMap = new Map<string, ScrapeJob>();
      initialJobs.forEach((job) => {
        jobsMap.set(job.prospectId, job);
      });
      setScrapeJobs(jobsMap);
    }
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  const closeDrawerAndClear = useCallback(() => {
    setIsOpen(false);
    setScrapeJobs(new Map());
  }, []);

  const getTotalPostsCount = useCallback(() => {
    let total = 0;
    scrapeJobs.forEach((job) => {
      total += job.numPosts;
    });
    return total;
  }, [scrapeJobs]);

  return (
    <ScrapeJobContext.Provider
      value={{
        isOpen,
        scrapeJobs,
        addScrapeJob,
        updateScrapeJob,
        removeScrapeJob,
        clearAll,
        openDrawer,
        closeDrawer,
        closeDrawerAndClear,
        getTotalPostsCount,
      }}
    >
      {children}
    </ScrapeJobContext.Provider>
  );
}

export function useScrapeJob() {
  const context = useContext(ScrapeJobContext);
  if (context === undefined) {
    throw new Error("useScrapeJob must be used within a ScrapeJobProvider");
  }
  return context;
}