"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RightSidePanel } from "@/components/ui/RightSidePanel";
import GlassPanel from "@/components/ui/GlassPanel";
import { GlassInput } from "@/components/ui/GlassInput";
import { LiquidButton } from "@/components/ui/LiquidButton";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/GlassAccordion";
import { useScrapeJob, ScrapeJob } from "@/contexts/ScrapeJobContext";
import { useProspectRefreshPostsParallel } from "@/hooks/api/useProspectRefreshPostsParallel";
import { useBrand } from "@/contexts/BrandContext";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import TagBadge from "./TagBadge";

// ---------------------------------------------
// Constants
// ---------------------------------------------
const POSTS_PER_KEYWORD = 100;
const MAX_KEYWORDS_PER_PROSPECT = 5;

const LOADING_MESSAGES = [
  "Channeling the digital realm...",
  "Harvesting fresh opportunities...",
  "Mining conversational gold...",
  "Distilling insights from the void...",
  "Summoning the data spirits...",
  "Weaving threads of connection...",
];

// ---------------------------------------------
// Hooks
// ---------------------------------------------
function useLoadingProgress(isPending: boolean, isSuccess: boolean) {
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    if (isPending) {
      setProgress(0);
      let currentProgress = 0;
      let messageIndex = 0;

      setLoadingMessage(LOADING_MESSAGES[0]);
      const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[messageIndex]);
      }, 2000);

      const progressInterval = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress > 90) currentProgress = 90;
        setProgress(currentProgress);
      }, 500);

      return () => {
        clearInterval(messageInterval);
        clearInterval(progressInterval);
      };
    } else if (isSuccess) {
      setProgress(100);
    }
  }, [isPending, isSuccess]);

  const reset = () => {
    setProgress(0);
    setLoadingMessage("");
  };

  return { progress, loadingMessage, reset };
}

// ---------------------------------------------
// Presentational subcomponents
// ---------------------------------------------
function KeywordsEditor({
  keywords,
  existingProspectKeywords,
  setKeywords,
  otherKeywords,
  keywordEngagementCounts,
  onChange,
}: {
  keywords: string[];
  existingProspectKeywords?: string[];
  setKeywords?: string[];
  otherKeywords?: string[];
  keywordEngagementCounts?: Record<string, number>;
  onChange: (nextKeywords: string[]) => void;
}) {
  const [newKeyword, setNewKeyword] = useState("");
  const { showToast } = useToast();

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newKeyword.trim()) {
      e.preventDefault();
      const trimmedKeyword = newKeyword.trim().toLowerCase();
      if (!keywords.includes(trimmedKeyword)) {
        const existingCount = existingProspectKeywords?.length || 0;
        const currentNewKeywords = keywords.length;
        const totalIfAdded = existingCount + currentNewKeywords + 1;
        
        if (totalIfAdded > MAX_KEYWORDS_PER_PROSPECT) {
          showToast({
            type: "error",
            message: `Cannot add more keywords. This prospect has ${existingCount} existing keyword${existingCount !== 1 ? 's' : ''} and ${currentNewKeywords} new keyword${currentNewKeywords !== 1 ? 's' : ''} selected. Maximum allowed is ${MAX_KEYWORDS_PER_PROSPECT} total.`,
            duration: 5000,
          });
          return;
        }
        onChange([...keywords, trimmedKeyword]);
      }
      setNewKeyword("");
    }
  };

  const handleToggleKeyword = (keyword: string) => {
    if (keywords.includes(keyword)) {
      onChange(keywords.filter((k) => k !== keyword));
    } else {
      const existingCount = existingProspectKeywords?.length || 0;
      const currentNewKeywords = keywords.length;
      const totalIfAdded = existingCount + currentNewKeywords + 1;
      
      if (totalIfAdded > MAX_KEYWORDS_PER_PROSPECT) {
        showToast({
          type: "error",
          message: `Cannot add more keywords. This prospect has ${existingCount} existing keyword${existingCount !== 1 ? 's' : ''} and ${currentNewKeywords} new keyword${currentNewKeywords !== 1 ? 's' : ''} selected. Maximum allowed is ${MAX_KEYWORDS_PER_PROSPECT} total.`,
          duration: 5000,
        });
        return;
      }
      onChange([...keywords, keyword]);
    }
  };

  // Combine all keywords, marking which are proven
  const provenKeywords = setKeywords || [];
  const availableKeywords = otherKeywords || [];
  // If no proven/available keywords, use the current keywords list
  const allKeywords =
    provenKeywords.length > 0 || availableKeywords.length > 0
      ? [...provenKeywords, ...availableKeywords]
      : keywords;

  // Check if there are any proven keywords with engagement
  const hasProvenKeywords =
    provenKeywords.length > 0 &&
    provenKeywords.some((k) => (keywordEngagementCounts?.[k] || 0) > 0);

  return (
    <div className="space-y-3">
      {/* Keywords Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-white/60">Keywords</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">
              {keywords.length} new
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
            <span className={`text-xs ${
              (existingProspectKeywords?.length || 0) + keywords.length > MAX_KEYWORDS_PER_PROSPECT
                ? "text-red-400"
                : "text-white/40"
            }`}>
              {(existingProspectKeywords?.length || 0) + keywords.length}/{MAX_KEYWORDS_PER_PROSPECT} total
            </span>
          </div>
        </div>

        {/* Helper text for proven keywords */}
        {hasProvenKeywords && (
          <p className="text-[10px] text-emerald-400/60 mb-2">
            ✨ Keywords with green highlight are top performers from existing
            leads
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3 max-h-32 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {allKeywords.map((keyword) => {
              const isSelected = keywords.includes(keyword);
              const isProven = provenKeywords.includes(keyword);
              const engagementCount = keywordEngagementCounts?.[keyword] || 0;

              return (
                <motion.div
                  key={keyword}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <div
                    onClick={() => handleToggleKeyword(keyword)}
                    className={cn(
                      "px-2 py-0.5 text-xs rounded-full cursor-pointer transition-all flex items-center gap-1",
                      isSelected
                        ? isProven && engagementCount > 0
                          ? "bg-emerald-500/20 hover:bg-red-500/20 border border-emerald-500/30"
                          : "bg-white/10 hover:bg-red-500/20 border border-white/20"
                        : isProven && engagementCount > 0
                        ? "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20"
                        : "bg-white/5 hover:bg-white/10 border border-white/10"
                    )}
                  >
                    <span
                      className={
                        isSelected
                          ? isProven && engagementCount > 0
                            ? "text-emerald-300"
                            : "text-white/70"
                          : isProven && engagementCount > 0
                          ? "text-emerald-300/70"
                          : "text-white/50"
                      }
                    >
                      {keyword}
                    </span>
                    {isProven && engagementCount > 0 && (
                      <span className="text-emerald-400/60 text-[10px]">
                        ×{engagementCount}
                      </span>
                    )}
                    <span
                      className={
                        isSelected
                          ? isProven && engagementCount > 0
                            ? "text-emerald-300/60"
                            : "text-white/40"
                          : "text-white/30"
                      }
                    >
                      {isSelected ? "×" : "+"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Manual Keyword Input */}
      <GlassInput
        type="text"
        placeholder="Add New Keyword..."
        value={newKeyword}
        onChange={(e) => setNewKeyword(e.target.value)}
        onKeyDown={handleAddKeyword}
        variant="ultra"
        shimmer={true}
        className="text-xs py-2"
      />
    </div>
  );
}

function LoadingProgressBar({ progress }: { progress: number }) {
  return (
    <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        className="h-full"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          background:
            "linear-gradient(90deg, rgba(168, 85, 247, 0.8) 0%, rgba(34, 197, 94, 0.9) 50%, rgba(168, 85, 247, 0.8) 100%)",
          boxShadow: "0 0 10px rgba(168, 85, 247, 0.6)",
        }}
      />
    </div>
  );
}

function WieldPowerButtonContent({
  isPending,
  progress,
  loadingMessage,
}: {
  isPending: boolean;
  progress: number;
  loadingMessage: string;
}) {
  return (
    <AnimatePresence mode="wait">
      {isPending ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </motion.div>
            <span>Wielding Power {Math.round(progress)}%</span>
          </div>
          <span className="text-xs opacity-80">{loadingMessage}</span>
        </motion.div>
      ) : (
        <motion.div
          key="idle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center gap-2"
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span className="font-semibold">Find More Leads</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatsHeader({
  hasJobs,
  totalNewKeywords,
  totalPosts,
}: {
  hasJobs: boolean;
  totalNewKeywords: number;
  totalPosts: number;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span
          className={`transition-all duration-500 text-2xl ${
            hasJobs ? "text-emerald-400" : "text-white/40"
          }`}
          style={{
            filter: hasJobs ? "brightness(1.2)" : "none",
            textShadow: hasJobs ? "0 0 20px rgba(34, 197, 94, 0.5)" : "none",
          }}
        >
          ⚡
        </span>
        <div>
          <h3 className="text-sm font-semibold text-white/90">
            Content Discovery Engine
          </h3>
          {hasJobs && (
            <div className="flex gap-2 mt-1">
              <span className="text-xs text-emerald-400">
                {totalNewKeywords} keywords
              </span>
              <span className="text-xs text-white/30">•</span>
              <span className="text-xs text-purple-400">
                {totalPosts} posts
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
        <svg
          className="w-8 h-8 text-white/30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <p className="text-white/40 mb-2">No scrape jobs configured</p>
      <p className="text-sm text-white/30">
        Add prospects from your dashboard to start configuring scrape jobs
      </p>
    </motion.div>
  );
}

// ---------------------------------------------
// ScrapeJobAccordion (uses subcomponents)
// ---------------------------------------------
interface ScrapeJobAccordionProps {
  job: ScrapeJob;
  onUpdate: (updates: Partial<ScrapeJob>) => void;
  onRemove: () => void;
}

function ScrapeJobAccordion({
  job,
  onUpdate,
  onRemove,
}: ScrapeJobAccordionProps) {
  return (
    <AccordionItem value={job.prospectId}>
      <AccordionTrigger
        badge={
          <div className="flex gap-1.5">
            <TagBadge
              label={`+${POSTS_PER_KEYWORD * job.keywords.length} posts`}
              variant="subreddit"
              className="w-24 text-xs"
            />
          </div>
        }
      >
        <span>{job.problemToSolve}</span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          {/* Keywords */}
          <KeywordsEditor
            keywords={job.keywords}
            existingProspectKeywords={job.existingProspectKeywords}
            setKeywords={job.setKeywords}
            otherKeywords={job.otherKeywords}
            keywordEngagementCounts={job.keywordEngagementCounts}
            onChange={(next) => onUpdate({ keywords: next })}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function ScrapeJobDrawer() {
  const { brand } = useBrand();
  const {
    isOpen,
    scrapeJobs,
    updateScrapeJob,
    removeScrapeJob,
    clearAll,
    closeDrawerAndClear,
  } = useScrapeJob();
  const refreshPosts = useProspectRefreshPostsParallel();
  const { showToast } = useToast();
  const { progress, loadingMessage, reset } = useLoadingProgress(
    refreshPosts.isPending,
    refreshPosts.isSuccess
  );

  const handleRunAllJobs = async () => {
    if (!brand?.id || scrapeJobs.size === 0) return;
    const jobsArray = Array.from(scrapeJobs.values());

    // Check keyword limits for each prospect
    for (const job of jobsArray) {
      const existingKeywords = job.existingProspectKeywords?.length || 0;
      const newKeywords = job.keywords.length;
      const totalKeywords = existingKeywords + newKeywords;
      
      if (totalKeywords > MAX_KEYWORDS_PER_PROSPECT) {
        showToast({
          type: "error",
          message: `Keyword limit exceeded for "${job.problemToSolve}". This prospect already has ${existingKeywords} keyword${existingKeywords !== 1 ? 's' : ''} and you're trying to add ${newKeywords} more (${totalKeywords} total). Maximum allowed is ${MAX_KEYWORDS_PER_PROSPECT}. Please remove keywords to continue.`,
          duration: 7000,
        });
        return;
      }
    }

    try {
      await refreshPosts.mutateAsync({
        brandId: brand.id,
        brandOfferings: brand.offerings,
        scrapeJobs: jobsArray,
      });

      // Close drawer and clear after showing success
      setTimeout(() => {
        closeDrawerAndClear();
        reset();
      }, 1500);
    } catch {
      showToast({
        type: "error",
        message:
          "Failed to wield power. The digital realm resists... Try again!",
        duration: 5000,
      });
      reset();
    }
  };

  const jobsArray = useMemo(
    () => Array.from(scrapeJobs.values()),
    [scrapeJobs]
  );

  const totalNewKeywords = useMemo(
    () => jobsArray.reduce((total, job) => total + job.keywords.length, 0),
    [jobsArray]
  );
  const totalPosts = useMemo(
    () =>
      jobsArray.reduce(
        (total, job) => total + POSTS_PER_KEYWORD * job.keywords.length,
        0
      ),
    [jobsArray]
  );

  return (
    <RightSidePanel
      isOpen={isOpen}
      onClose={closeDrawerAndClear}
      title="Confirm Scraping Reddit?"
    >
      <div className="flex flex-col h-full">
        {/* Top Action Section with Wield Power */}
        <div className="px-6 py-4 border-b border-white/10">
          <GlassPanel variant="medium" className="p-4">
            <StatsHeader
              hasJobs={scrapeJobs.size > 0}
              totalNewKeywords={totalNewKeywords}
              totalPosts={totalPosts}
            />

            {/* Description */}
            <p className="text-xs text-white/60 mb-4">
              {scrapeJobs.size > 0
                ? "Configure keywords and post counts for each prospect below. Ready to discover fresh opportunities!"
                : "Add prospects and configure their scrape jobs to harness AI-powered content discovery."}
            </p>

            {/* Action buttons */}
            <div className="flex gap-2">
              <LiquidButton
                onClick={handleRunAllJobs}
                variant="primary"
                size="md"
                shimmer={scrapeJobs.size > 0 && !refreshPosts.isPending}
                liquid={!refreshPosts.isPending}
                disabled={scrapeJobs.size === 0 || refreshPosts.isPending}
                className="flex-1 relative overflow-hidden"
              >
                <WieldPowerButtonContent
                  isPending={refreshPosts.isPending}
                  progress={progress}
                  loadingMessage={loadingMessage}
                />
              </LiquidButton>
              <LiquidButton
                onClick={clearAll}
                variant="ghost"
                size="sm"
                disabled={scrapeJobs.size === 0 || refreshPosts.isPending}
                className="px-4"
              >
                Clear
              </LiquidButton>
            </div>

            {/* Progress bar */}
            {refreshPosts.isPending && (
              <LoadingProgressBar progress={progress} />
            )}
          </GlassPanel>
        </div>

        {/* Scrollable Accordion Section */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {jobsArray.length > 0 ? (
            <Accordion type="multiple" className="space-y-2">
              <AnimatePresence mode="popLayout">
                {jobsArray.map((job) => (
                  <motion.div
                    key={job.prospectId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <ScrapeJobAccordion
                      job={job}
                      onUpdate={(updates) =>
                        updateScrapeJob(job.prospectId, updates)
                      }
                      onRemove={() => removeScrapeJob(job.prospectId)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </Accordion>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </RightSidePanel>
  );
}
