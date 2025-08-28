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
const POST_COUNT_OPTIONS = [25, 50, 75, 100];

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
  onChange,
}: {
  keywords: string[];
  onChange: (nextKeywords: string[]) => void;
}) {
  const [newKeyword, setNewKeyword] = useState("");

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newKeyword.trim()) {
      e.preventDefault();
      const trimmedKeyword = newKeyword.trim().toLowerCase();
      if (!keywords.includes(trimmedKeyword)) {
        onChange([...keywords, trimmedKeyword]);
      }
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    onChange(keywords.filter((k) => k !== keyword));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-white/60">Keywords</label>
        <span className="text-xs text-white/40">{keywords.length} active</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3 max-h-32 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {keywords.map((keyword) => (
            <motion.div
              key={keyword}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <div
                onClick={() => handleRemoveKeyword(keyword)}
                className="px-2 py-0.5 text-xs rounded-full bg-white/10 hover:bg-red-500/20 cursor-pointer transition-colors flex items-center gap-1"
              >
                <span className="text-white/70">{keyword}</span>
                <span className="text-white/40">×</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <GlassInput
        type="text"
        placeholder="Add keyword..."
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

function PostsCountSelector({
  selected,
  onChange,
}: {
  selected: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="text-xs text-white/60 mb-2 block">
        Number of Posts / Keyword
      </label>
      <div className="grid grid-cols-4 gap-2">
        {POST_COUNT_OPTIONS.map((count) => (
          <button
            key={count}
            onClick={() => onChange(count)}
            className={cn(
              "py-2 px-3 text-xs rounded-lg transition-all",
              selected === count
                ? "bg-gradient-to-r from-purple-500/30 to-green-500/30 text-white border border-white/20"
                : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
            )}
          >
            {count}
          </button>
        ))}
      </div>
    </div>
  );
}

function DeleteJobButton({ onRemove }: { onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="w-full py-2 px-3 text-xs rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors flex items-center justify-center gap-2"
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
      Remove Scrape Job
    </button>
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
          <span className="font-semibold">Wield Power</span>
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
  const handlePostsCountChange = (value: number) =>
    onUpdate({ numPosts: value });

  return (
    <AccordionItem value={job.prospectId}>
      <AccordionTrigger
        badge={
          <div className="flex gap-1.5">
            <TagBadge
              label={`+${job.numPosts * job.keywords.length} posts`}
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
            onChange={(next) => onUpdate({ keywords: next })}
          />

          {/* Posts count */}
          <PostsCountSelector
            selected={job.numPosts}
            onChange={handlePostsCountChange}
          />

          {/* Delete button */}
          <DeleteJobButton onRemove={onRemove} />
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
    closeDrawer,
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

    try {
      await refreshPosts.mutateAsync({
        brandId: brand.id,
        brandOfferings: brand.offerings,
        scrapeJobs: jobsArray,
      });

      // Close drawer after showing success
      setTimeout(() => {
        closeDrawer();
        clearAll();
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
        (total, job) => total + job.numPosts * job.keywords.length,
        0
      ),
    [jobsArray]
  );

  return (
    <RightSidePanel
      isOpen={isOpen}
      onClose={closeDrawer}
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
