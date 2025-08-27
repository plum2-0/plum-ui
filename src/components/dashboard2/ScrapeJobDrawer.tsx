"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RightSidePanel } from "@/components/ui/RightSidePanel";
import GlassPanel from "@/components/ui/GlassPanel";
import { GlassInput } from "@/components/ui/GlassInput";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from "@/components/ui/GlassAccordion";
import { useScrapeJob, ScrapeJob } from "@/contexts/ScrapeJobContext";
import { useProspectRefreshPostsParallel } from "@/hooks/api/useProspectRefreshPostsParallel";
import { useBrand } from "@/contexts/BrandContext";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { glassStyles } from "@/lib/styles/glassMorphism";
import { liquidGradients } from "@/lib/styles/gradients";

interface ScrapeJobAccordionProps {
  job: ScrapeJob;
  onUpdate: (updates: Partial<ScrapeJob>) => void;
  onRemove: () => void;
}

function ScrapeJobAccordion({ job, onUpdate, onRemove }: ScrapeJobAccordionProps) {
  const [newKeyword, setNewKeyword] = useState("");

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newKeyword.trim()) {
      e.preventDefault();
      const trimmedKeyword = newKeyword.trim().toLowerCase();
      if (!job.keywords.includes(trimmedKeyword)) {
        onUpdate({ keywords: [...job.keywords, trimmedKeyword] });
      }
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    onUpdate({ keywords: job.keywords.filter((k) => k !== keyword) });
  };

  const handlePostsCountChange = (value: number) => {
    onUpdate({ numPosts: value });
  };

  const postCountOptions = [25, 50, 75, 100];

  return (
    <AccordionItem value={job.prospectId}>
      <AccordionTrigger
        badge={
          <div className="flex gap-2">
            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
              {job.keywords.length} keywords
            </span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
              {job.numPosts} posts
            </span>
          </div>
        }
        subtitle={job.brandName}
      >
        <span className="line-clamp-1">{job.problemToSolve}</span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          {/* Keywords section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/60">Keywords</label>
              <span className="text-xs text-white/40">{job.keywords.length} active</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3 max-h-32 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {job.keywords.map((keyword) => (
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

          {/* Posts count section */}
          <div>
            <label className="text-xs text-white/60 mb-2 block">Posts to Analyze</label>
            <div className="grid grid-cols-4 gap-2">
              {postCountOptions.map((count) => (
                <button
                  key={count}
                  onClick={() => handlePostsCountChange(count)}
                  className={cn(
                    "py-2 px-3 text-xs rounded-lg transition-all",
                    job.numPosts === count
                      ? "bg-gradient-to-r from-purple-500/30 to-green-500/30 text-white border border-white/20"
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                  )}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Delete button */}
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
    getTotalPostsCount,
  } = useScrapeJob();
  const refreshPosts = useProspectRefreshPostsParallel();
  const { showToast } = useToast();
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Loading messages that cycle through
  const loadingMessages = [
    "Channeling the digital realm...",
    "Harvesting fresh opportunities...",
    "Mining conversational gold...",
    "Distilling insights from the void...",
    "Summoning the data spirits...",
    "Weaving threads of connection...",
  ];

  // Simulate progress during loading
  useEffect(() => {
    if (refreshPosts.isPending) {
      setProgress(0);
      let currentProgress = 0;
      let messageIndex = 0;
      
      // Update loading message
      setLoadingMessage(loadingMessages[0]);
      const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 2000);

      // Simulate progress
      const progressInterval = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress > 90) currentProgress = 90; // Never quite reach 100% until done
        setProgress(currentProgress);
      }, 500);

      return () => {
        clearInterval(messageInterval);
        clearInterval(progressInterval);
      };
    } else if (refreshPosts.isSuccess) {
      setProgress(100);
    }
  }, [refreshPosts.isPending, refreshPosts.isSuccess]);

  const handleRunAllJobs = async () => {
    if (!brand?.id || scrapeJobs.size === 0) return;

    const jobsArray = Array.from(scrapeJobs.values());
    
    try {
      const result = await refreshPosts.mutateAsync({
        brandId: brand.id,
        brandOfferings: brand.offerings,
        scrapeJobs: jobsArray,
      });

      // Show epic success toast
      const totalPostsFound = result?.successCount || 0;
      const totalProspects = jobsArray.length;
      
      showToast({
        type: 'success',
        message: `🚀 Power unleashed! Discovered ${totalPostsFound} fresh opportunities across ${totalProspects} prospect${totalProspects !== 1 ? 's' : ''}. Your content arsenal is loaded!`,
        duration: 6000,
        icon: (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="text-3xl"
          >
            ⚡
          </motion.div>
        ),
      });

      // Close drawer after showing success
      setTimeout(() => {
        closeDrawer();
        clearAll();
        setProgress(0);
        setLoadingMessage("");
      }, 1500);
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to wield power. The digital realm resists... Try again!',
        duration: 5000,
      });
      setProgress(0);
    }
  };

  const jobsArray = Array.from(scrapeJobs.values());
  const totalPosts = getTotalPostsCount();
  
  // Calculate total new keywords across all jobs
  const totalNewKeywords = jobsArray.reduce((total, job) => total + job.keywords.length, 0);

  return (
    <RightSidePanel
      isOpen={isOpen}
      onClose={closeDrawer}
      title="Configure Scrape Jobs"
    >
      <div className="flex flex-col h-full">
        {/* Top Action Section with Wield Power */}
        <div className="px-6 py-4 border-b border-white/10">
          <GlassPanel variant="medium" className="p-4">
            {/* Stats */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`transition-all duration-500 text-2xl ${
                    scrapeJobs.size > 0 ? "text-emerald-400" : "text-white/40"
                  }`}
                  style={{
                    filter: scrapeJobs.size > 0 ? "brightness(1.2)" : "none",
                    textShadow: scrapeJobs.size > 0
                      ? "0 0 20px rgba(34, 197, 94, 0.5)"
                      : "none",
                  }}
                >
                  ⚡
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white/90">
                    Content Discovery Engine
                  </h3>
                  {scrapeJobs.size > 0 && (
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
                <AnimatePresence mode="wait">
                  {refreshPosts.isPending ? (
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
              <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    background: "linear-gradient(90deg, rgba(168, 85, 247, 0.8) 0%, rgba(34, 197, 94, 0.9) 50%, rgba(168, 85, 247, 0.8) 100%)",
                    boxShadow: "0 0 10px rgba(168, 85, 247, 0.6)",
                  }}
                />
              </div>
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
                      onUpdate={(updates) => updateScrapeJob(job.prospectId, updates)}
                      onRemove={() => removeScrapeJob(job.prospectId)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </Accordion>
          ) : (
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
          )}
        </div>
      </div>
    </RightSidePanel>
  );
}