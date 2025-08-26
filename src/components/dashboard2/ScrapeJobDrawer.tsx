"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Drawer } from "@/components/ui/Drawer";
import GlassPanel from "@/components/ui/GlassPanel";
import { GlassInput } from "@/components/ui/GlassInput";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { LiquidBadge } from "@/components/ui/LiquidBadge";
import { useScrapeJob, ScrapeJob } from "@/contexts/ScrapeJobContext";
import { useProspectRefreshPostsParallel } from "@/hooks/api/useProspectRefreshPostsParallel";
import { useBrand } from "@/contexts/BrandContext";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { glassStyles } from "@/lib/styles/glassMorphism";
import { liquidGradients } from "@/lib/styles/gradients";

interface ScrapeJobCardProps {
  job: ScrapeJob;
  onUpdate: (updates: Partial<ScrapeJob>) => void;
  onRemove: () => void;
  index: number;
}

function ScrapeJobCard({ job, onUpdate, onRemove, index }: ScrapeJobCardProps) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className="h-full"
    >
      <GlassPanel variant="medium" className="p-4 h-full relative overflow-hidden flex flex-col">
        {/* Delete button */}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-red-500/20 transition-colors z-10"
        >
          <svg
            className="w-3.5 h-3.5 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Prospect info */}
        <div className="mb-3 pr-6">
          <h3 className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent line-clamp-2">
            {job.problemToSolve}
          </h3>
          <p className="text-xs text-white/40 mt-0.5">{job.brandName}</p>
        </div>

        {/* Keywords section */}
        <div className="flex-1 flex flex-col mb-3">
          <label className="text-xs text-white/60 mb-1.5">Keywords</label>
          <div className="flex-1 overflow-y-auto max-h-32 mb-2">
            <div className="flex flex-wrap gap-1.5">
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

        {/* Posts count buttons */}
        <div>
          <label className="text-xs text-white/60 mb-1.5 block">Posts Count</label>
          <div className="grid grid-cols-4 gap-1">
            {postCountOptions.map((count) => (
              <button
                key={count}
                onClick={() => handlePostsCountChange(count)}
                className={cn(
                  "py-1 px-2 text-xs rounded-lg transition-all",
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

        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            background: liquidGradients.purpleGreenSubtle,
          }}
        />
      </GlassPanel>
    </motion.div>
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
    <Drawer
      isOpen={isOpen}
      onClose={closeDrawer}
      title="Configure Scrape Jobs"
      height="lg"
    >
      <div className="pb-24">
        {/* Job cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {jobsArray.length > 0 ? (
              jobsArray.map((job, index) => (
                <ScrapeJobCard
                  key={job.prospectId}
                  job={job}
                  index={index}
                  onUpdate={(updates) => updateScrapeJob(job.prospectId, updates)}
                  onRemove={() => removeScrapeJob(job.prospectId)}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12"
              >
                <p className="text-white/40">No scrape jobs configured</p>
                <p className="text-sm text-white/30 mt-2">
                  Add prospects to start configuring scrape jobs
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed bottom action bar with integrated stats */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t border-white/10"
        style={{
          background: scrapeJobs.size > 0
            ? "linear-gradient(145deg, rgba(34, 197, 94, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%)"
            : glassStyles.heavy.background,
          backdropFilter: glassStyles.heavy.backdropFilter,
          WebkitBackdropFilter: glassStyles.heavy.WebkitBackdropFilter,
          borderRadius: "24px 24px 0 0",
          boxShadow: scrapeJobs.size > 0
            ? "0 -8px 32px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            : glassStyles.heavy.boxShadow,
        }}
      >
        <div className="p-4">
          {/* Stats and description */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
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
                <h3
                  className="text-lg font-semibold transition-all duration-500"
                  style={{
                    background: scrapeJobs.size > 0
                      ? "linear-gradient(90deg, #22c55e, #a855f7, #22c55e)"
                      : "none",
                    backgroundSize: scrapeJobs.size > 0 ? "200% auto" : "auto",
                    WebkitBackgroundClip: scrapeJobs.size > 0 ? "text" : "unset",
                    WebkitTextFillColor: scrapeJobs.size > 0
                      ? "transparent"
                      : "rgba(255, 255, 255, 0.9)",
                    animation: scrapeJobs.size > 0
                      ? "shimmer 3s linear infinite"
                      : "none",
                  }}
                >
                  Content Discovery Engine
                </h3>
                {scrapeJobs.size > 0 && (
                  <div className="flex gap-3">
                    <span
                      className="px-3 py-1 text-xs rounded-full"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.15) 100%)",
                        border: "1px solid rgba(34, 197, 94, 0.4)",
                        color: "#86efac",
                        boxShadow:
                          "0 2px 8px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      {totalNewKeywords} keyword{totalNewKeywords !== 1 ? "s" : ""}
                    </span>
                    <span
                      className="px-3 py-1 text-xs rounded-full"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0.15) 100%)",
                        border: "1px solid rgba(168, 85, 247, 0.4)",
                        color: "#c084fc",
                        boxShadow:
                          "0 2px 8px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      {totalPosts} post{totalPosts !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
              <p
                className="text-sm transition-all duration-500"
                style={{
                  color: scrapeJobs.size > 0 ? "#86efac" : "rgba(255, 255, 255, 0.5)",
                  textShadow: scrapeJobs.size > 0
                    ? "0 0 10px rgba(34, 197, 94, 0.3)"
                    : "none",
                }}
              >
                {scrapeJobs.size > 0
                  ? `🚀 Ready to discover ${totalPosts} fresh ${totalPosts === 1 ? 'opportunity' : 'opportunities'} across ${scrapeJobs.size} ${scrapeJobs.size === 1 ? 'prospect' : 'prospects'}`
                  : "Configure scrape jobs to harness AI-powered content discovery"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <LiquidButton
              onClick={clearAll}
              variant="ghost"
              size="md"
              disabled={scrapeJobs.size === 0 || refreshPosts.isPending}
              className="px-4"
            >
              Clear All
            </LiquidButton>
            <LiquidButton
              onClick={handleRunAllJobs}
              variant="primary"
              size="lg"
              shimmer={scrapeJobs.size > 0 && !refreshPosts.isPending}
              liquid={!refreshPosts.isPending}
              disabled={scrapeJobs.size === 0 || refreshPosts.isPending}
              className="flex-1 relative overflow-hidden"
              style={{
                filter: scrapeJobs.size > 0
                  ? refreshPosts.isPending
                    ? "drop-shadow(0 0 30px rgba(168, 85, 247, 0.6))"
                    : "drop-shadow(0 0 20px rgba(34, 197, 94, 0.4))"
                  : "none",
                transform: scrapeJobs.size > 0 ? "scale(1.02)" : "scale(1)",
              }}
            >
              <AnimatePresence mode="wait">
                {refreshPosts.isPending ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  >
                    {/* Loading content with progress bar */}
                    <div className="flex flex-col items-center gap-2 py-1">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <svg
                            className="w-5 h-5 text-white"
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
                        <span className="font-semibold text-white">
                          Wielding Power
                        </span>
                        <motion.span
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-white"
                        >
                          {Math.round(progress)}%
                        </motion.span>
                      </div>
                      
                      {/* Epic loading message */}
                      <motion.div
                        key={loadingMessage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xs text-white/80 font-medium"
                      >
                        {loadingMessage}
                      </motion.div>
                    </div>

                    {/* Progress bar overlay - thin bar at bottom */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-1"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      style={{
                        background: "linear-gradient(90deg, rgba(168, 85, 247, 0.8) 0%, rgba(34, 197, 94, 0.9) 50%, rgba(168, 85, 247, 0.8) 100%)",
                        boxShadow: "0 0 10px rgba(168, 85, 247, 0.6), 0 0 20px rgba(34, 197, 94, 0.4)",
                        borderRadius: "0 2px 2px 0",
                      }}
                    >
                      {/* Shimmer effect on progress */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 1.5s linear infinite",
                        }}
                      />
                    </motion.div>
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
                      className="w-5 h-5"
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
                    <span className="font-semibold">
                      Wield Power
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </LiquidButton>
          </div>
        </div>

        {/* Shimmer animation */}
        {scrapeJobs.size > 0 && (
          <style jsx>{`
            @keyframes shimmer {
              0% {
                background-position: -200% center;
              }
              100% {
                background-position: 200% center;
              }
            }
          `}</style>
        )}
      </div>
    </Drawer>
  );
}