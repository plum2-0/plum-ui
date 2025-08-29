"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassInput } from "@/components/ui/GlassInput";
import { useScrapeJob } from "@/contexts/ScrapeJobContext";
import { useBrand } from "@/contexts/BrandContext";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import KeywordSuggest from "./KeywordSuggestSimple";

interface QuickAddKeywordProps {
  prospectId: string;
  problemToSolve: string;
  existingKeywords?: string[];
  insights?: any;
  className?: string;
}

export default function QuickAddKeyword({
  prospectId,
  problemToSolve,
  existingKeywords = [],
  insights,
  className,
}: QuickAddKeywordProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrapeJobs, addScrapeJob, updateScrapeJob, openDrawer } = useScrapeJob();
  const { brand } = useBrand();
  const { showToast } = useToast();

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const handleExpand = () => {
    setIsAnimating(true);
    setIsExpanded(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setKeyword("");
  };

  const handleSubmit = () => {
    const trimmedKeyword = keyword.trim().toLowerCase();
    
    if (!trimmedKeyword) {
      showToast({
        message: "Please enter a keyword",
        type: "error",
      });
      return;
    }

    if (existingKeywords.includes(trimmedKeyword)) {
      showToast({
        message: "This keyword already exists for this prospect",
        type: "error",
      });
      return;
    }

    if (!brand?.name) {
      showToast({
        message: "Brand information is missing",
        type: "error",
      });
      return;
    }

    // Check if there's an existing job for this prospect
    const existingJob = scrapeJobs.get(prospectId);
    
    if (existingJob) {
      // Add keyword to existing job
      const updatedKeywords = [...existingJob.keywords, trimmedKeyword];
      updateScrapeJob(prospectId, { keywords: updatedKeywords });
    } else {
      // Create a new job with all keywords
      const newScrapeJob = {
        prospectId,
        brandName: brand.name,
        problemToSolve,
        keywords: [trimmedKeyword],
        existingProspectKeywords: existingKeywords,
        numPosts: 100,
      };
      addScrapeJob(newScrapeJob);
    }
    
    openDrawer();
    
    showToast({
      message: `Added keyword "${trimmedKeyword}" to scrape queue`,
      type: "success",
    });

    handleCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)} data-tour="quick-add-keyword">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="button"
            onClick={handleExpand}
            className="group relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(168, 85, 247, 0.15) 0%, 
                  rgba(34, 197, 94, 0.15) 100%)`,
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
              whileHover={{
                scale: 1.1,
                background: `linear-gradient(135deg, 
                  rgba(168, 85, 247, 0.25) 0%, 
                  rgba(34, 197, 94, 0.25) 100%)`,
                boxShadow: "0 6px 20px rgba(168, 85, 247, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.svg
                className="w-4 h-4 text-white/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: 0 }}
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </motion.svg>
            </motion.div>
            
            {/* Shimmer effect on hover */}
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
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
          </motion.button>
        ) : (
          <motion.div
            key="input"
            className="flex items-center gap-2"
            initial={{ width: 32, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 32, opacity: 0 }}
            transition={{ 
              width: { duration: 0.3, ease: "easeOut" },
              opacity: { duration: 0.2 }
            }}
          >
            <div className="relative" style={{ width: "200px" }}>
              <GlassInput
                ref={inputRef as any}
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter keyword..."
                variant="medium"
                shimmer={true}
                className="text-sm h-8 py-1 text-white placeholder:text-white/40"
                style={{
                  paddingRight: "60px",
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                }}
                whileFocus={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                  boxShadow: "0 6px 20px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                  borderColor: "transparent",
                }}
              />
              
              {/* Action buttons inside input */}
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                <motion.button
                  onClick={handleSubmit}
                  className="px-2 py-0.5 rounded-lg text-xs font-medium cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                  }}
                  whileHover={{
                    background: "linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.3))",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    className="w-3 h-3 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.button>
                
                <motion.button
                  onClick={handleCancel}
                  className="px-2 py-0.5 rounded-lg text-xs font-medium cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                  }}
                  whileHover={{
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3))",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    className="w-3 h-3 text-red-400"
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
                </motion.button>
              </div>
            </div>
            
            {/* KeywordSuggest Button - shown when expanded */}
            <KeywordSuggest
              prospectId={prospectId}
              problemToSolve={problemToSolve}
              existingKeywords={existingKeywords}
              insights={insights}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}