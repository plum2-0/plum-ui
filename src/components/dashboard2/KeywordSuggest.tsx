"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useGenerateKeywords } from "@/hooks/api/useAgentQuery";
import { useScrapeJob } from "@/contexts/ScrapeJobContext";
import { useBrand } from "@/contexts/BrandContext";
import { useToast } from "@/components/ui/Toast";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { cn } from "@/lib/utils";

interface KeywordSuggestProps {
  prospectId: string;
  problemToSolve: string;
  existingKeywords?: string[];
  insights: any;
  className?: string;
}

export default function KeywordSuggest({
  prospectId,
  problemToSolve,
  existingKeywords = [],
  insights,
  className,
}: KeywordSuggestProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [loadingMessage, setLoadingMessage] = useState("Analyzing your market...");
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const generateKeywordsMutation = useGenerateKeywords();
  const { scrapeJobs, addScrapeJob, updateScrapeJob, openDrawer } = useScrapeJob();
  const { brand } = useBrand();
  const { showToast } = useToast();

  // Loading messages rotation
  useEffect(() => {
    if (!generateKeywordsMutation.isPending) return;

    const messages = [
      "Analyzing your market...",
      "Identifying trending topics...",
      "Finding relevant keywords...",
      "Generating suggestions...",
      "Almost ready...",
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingMessage(messages[index]);
    }, 2000);

    return () => clearInterval(interval);
  }, [generateKeywordsMutation.isPending]);


  // No click outside handler needed - we use the backdrop for that

  const handleOpen = async () => {
    setIsOpen(true);
    setSelectedKeywords(new Set());

    // Trigger keyword generation
    try {
      const result = await generateKeywordsMutation.mutateAsync({
        problem: problemToSolve,
        topKeywords: existingKeywords.slice(0, 5),
        insights: insights || {
          general_summary: "",
          identified_solutions: [],
          willingness_to_pay: "",
          demographic_breakdown: [],
          top_competitors: [],
          tag_counts: {
            potential_customer: 0,
            competitor_mention: 0,
          },
        },
      });

      // Pre-select all keywords
      if (result?.keywords) {
        setSelectedKeywords(new Set(result.keywords));
      }
    } catch (error) {
      console.error("Failed to generate keywords:", error);
      showToast({
        message: "Failed to generate keyword suggestions",
        type: "error",
      });
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedKeywords(new Set());
    generateKeywordsMutation.reset();
  };

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyword)) {
        newSet.delete(keyword);
      } else {
        newSet.add(keyword);
      }
      return newSet;
    });
  };

  const handleAddToQueue = () => {
    if (!brand?.name) {
      showToast({
        message: "Brand information is missing",
        type: "error",
      });
      return;
    }

    if (selectedKeywords.size === 0) {
      showToast({
        message: "Please select at least one keyword",
        type: "error",
      });
      return;
    }

    const keywordsArray = Array.from(selectedKeywords);

    // Filter out existing keywords
    const newKeywords = keywordsArray.filter(
      (kw) => !existingKeywords.includes(kw)
    );

    if (newKeywords.length === 0) {
      showToast({
        message: "All selected keywords already exist",
        type: "error",
      });
      return;
    }

    // Check if there's an existing job for this prospect
    const existingJob = scrapeJobs.get(prospectId);
    
    if (existingJob) {
      // Merge new keywords with existing ones
      const mergedKeywords = [...new Set([...existingJob.keywords, ...newKeywords])];
      updateScrapeJob(prospectId, { keywords: mergedKeywords });
    } else {
      // Create a new job
      const newScrapeJob = {
        prospectId,
        brandName: brand.name,
        problemToSolve,
        keywords: newKeywords,
        existingProspectKeywords: existingKeywords,
        numPosts: 100,
      };
      addScrapeJob(newScrapeJob);
    }

    openDrawer();

    showToast({
      message: `Added ${newKeywords.length} keyword${
        newKeywords.length > 1 ? "s" : ""
      } to scrape queue`,
      type: "success",
    });

    handleClose();
  };

  const suggestedKeywords = generateKeywordsMutation.data?.keywords || [];

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          // AI Button
          <motion.button
            ref={buttonRef}
            key="ai-button"
            onClick={handleOpen}
            className="group relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="px-3 py-1.5 rounded-full flex items-center gap-2 cursor-pointer"
              style={{
                background: `linear-gradient(135deg,
                  rgba(147, 51, 234, 0.15) 0%,
                  rgba(59, 130, 246, 0.15) 100%)`,
                backdropFilter: "blur(20px)",
                border: "1px solid transparent",
                backgroundImage: `
                  linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(59, 130, 246, 0.15)),
                  linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.3))`,
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
                boxShadow:
                  "0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 6px 20px rgba(147, 51, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* AI Sparkle Icon */}
              <motion.svg
                className="w-4 h-4 text-purple-300"
                fill="currentColor"
                viewBox="0 0 24 24"
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <path d="M12 2l1.09 6.26L18 7l-4.91 1.26L12 14.5l-1.09-6.24L6 7l4.91 1.26L12 2zm5.5 7l.61 3.53L21 12l-2.89.47L17.5 16l-.61-3.53L14 12l2.89-.47L17.5 9zm-11 0l.61 3.53L10 12l-2.89.47L6.5 16l-.61-3.53L3 12l2.89-.47L6.5 9z" />
              </motion.svg>

              <span className="text-white/80 text-sm font-medium">
                Suggest
              </span>

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                  }}
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.button>
        ) : null}
      </AnimatePresence>
      
      {/* Modal rendered in portal */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence mode="wait">
          {isOpen && (
            <>
              {/* Semi-transparent backdrop */}
              <motion.div 
                className="fixed inset-0 bg-black/50 z-[9998]"
                onClick={handleClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Centered modal */}
              <motion.div
                data-portal-id="keyword-modal"
                className="fixed left-1/2 top-1/2 z-[9999] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 max-h-[85vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
              <div
                className="p-6 rounded-2xl"
              style={{
                background: `linear-gradient(135deg,
                  rgba(20, 20, 25, 0.95) 0%,
                  rgba(15, 15, 20, 0.9) 100%)`,
                backdropFilter: "blur(30px)",
                border: "1px solid transparent",
                backgroundImage: `
                  linear-gradient(135deg, rgba(20, 20, 25, 0.95), rgba(15, 15, 20, 0.9)),
                  linear-gradient(135deg,
                    rgba(147, 51, 234, 0.3),
                    rgba(59, 130, 246, 0.3)
                  )`,
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
                boxShadow:
                  "0 20px 60px rgba(0, 0, 0, 0.7), 0 0 100px rgba(147, 51, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(147, 51, 234, 0.25), rgba(59, 130, 246, 0.25))",
                      border: "1px solid rgba(147, 51, 234, 0.4)",
                      boxShadow:
                        "0 4px 12px rgba(147, 51, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <svg
                      className="w-5 h-5 text-purple-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l1.09 6.26L18 7l-4.91 1.26L12 14.5l-1.09-6.24L6 7l4.91 1.26L12 2zm5.5 7l.61 3.53L21 12l-2.89.47L17.5 16l-.61-3.53L14 12l2.89-.47L17.5 9zm-11 0l.61 3.53L10 12l-2.89.47L6.5 16l-.61-3.53L3 12l2.89-.47L6.5 9z" />
                    </svg>
                  </motion.div>
                  <h3 className="text-white text-lg font-heading font-semibold">
                    AI Keyword Suggestions
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-white/60"
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
              </div>

              {/* Content */}
              <div className="space-y-4">
                {generateKeywordsMutation.isPending ? (
                  // Loading State
                  <motion.div
                    className="py-8 flex flex-col items-center justify-center space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Animated dots */}
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-3 h-3 rounded-full"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(147, 51, 234, 0.6), rgba(59, 130, 246, 0.6))",
                          }}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>

                    {/* Loading message */}
                    <motion.p
                      key={loadingMessage}
                      className="text-white/70 text-sm font-body"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {loadingMessage}
                    </motion.p>
                  </motion.div>
                ) : suggestedKeywords.length > 0 ? (
                  // Keywords Display
                  <>
                    <p className="text-white/70 text-sm font-body">
                      Select keywords to add to your scraping queue:
                    </p>

                    <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar">
                      {suggestedKeywords.map((keyword, index) => {
                        const isSelected = selectedKeywords.has(keyword);
                        const isExisting = existingKeywords.includes(keyword);

                        return (
                          <motion.div
                            key={keyword}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isExisting) {
                                  toggleKeyword(keyword);
                                }
                              }}
                              disabled={isExisting}
                              className={cn(
                                "w-full p-3 rounded-xl flex items-center gap-3 transition-all",
                                isExisting
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer hover:scale-[1.02]"
                              )}
                              style={{
                                background: isSelected
                                  ? "linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(59, 130, 246, 0.15))"
                                  : "rgba(255, 255, 255, 0.05)",
                                border: `1px solid ${
                                  isSelected
                                    ? "rgba(147, 51, 234, 0.3)"
                                    : "rgba(255, 255, 255, 0.1)"
                                }`,
                                boxShadow: isSelected
                                  ? "0 4px 12px rgba(147, 51, 234, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                                  : "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                              }}
                            >
                              {/* Checkbox */}
                              <div
                                className="w-5 h-5 rounded flex items-center justify-center"
                                style={{
                                  background: isSelected
                                    ? "linear-gradient(135deg, rgba(147, 51, 234, 0.8), rgba(59, 130, 246, 0.8))"
                                    : "rgba(255, 255, 255, 0.1)",
                                  border: "1px solid rgba(255, 255, 255, 0.2)",
                                }}
                              >
                                {isSelected && (
                                  <motion.svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring" }}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </motion.svg>
                                )}
                              </div>

                              {/* Keyword text */}
                              <span className="flex-1 text-left text-white/90 font-medium">
                                {keyword}
                              </span>

                              {/* Status badges */}
                              {isExisting && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                  Already exists
                                </span>
                              )}

                              {!isExisting && isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30"
                                >
                                  Selected
                                </motion.div>
                              )}
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-6">
                      <LiquidButton
                        variant="primary"
                        size="sm"
                        onClick={handleAddToQueue}
                        disabled={selectedKeywords.size === 0}
                        shimmer={selectedKeywords.size > 0}
                        className="flex-1"
                      >
                        <div className="flex items-center gap-2">
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
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <span>
                            Add {selectedKeywords.size || ""} New Words
                          </span>
                        </div>
                      </LiquidButton>
                      <LiquidButton
                        variant="secondary"
                        size="sm"
                        onClick={handleClose}
                      >
                        Cancel
                      </LiquidButton>
                    </div>
                  </>
                ) : (
                  // Error State
                  <div className="py-8 text-center">
                    <p className="text-white/70 text-sm font-body">
                      No suggestions available at the moment.
                    </p>
                  </div>
                )}
              </div>
              </div>
            </motion.div>
          </>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}