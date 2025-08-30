"use client";

import React, { useState, useEffect } from "react";
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

export default function KeywordSuggestSimple({
  prospectId,
  problemToSolve,
  existingKeywords = [],
  insights,
  className,
}: KeywordSuggestProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(
    new Set()
  );

  const generateKeywordsMutation = useGenerateKeywords();
  const { scrapeJobs, addScrapeJob, updateScrapeJob, openDrawer } =
    useScrapeJob();
  const { brand } = useBrand();
  const { showToast } = useToast();

  const handleOpen = async () => {
    console.log("Opening modal");
    setIsOpen(true);
    setSelectedKeywords(new Set());

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
    console.log("Closing modal");
    setIsOpen(false);
    setSelectedKeywords(new Set());
    generateKeywordsMutation.reset();
  };

  const toggleKeyword = (keyword: string) => {
    console.log("Toggling keyword:", keyword);
    const newSet = new Set(selectedKeywords);
    if (newSet.has(keyword)) {
      newSet.delete(keyword);
    } else {
      newSet.add(keyword);
    }
    setSelectedKeywords(newSet);
    console.log("New selection size:", newSet.size);
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

    const existingJob = scrapeJobs.get(prospectId);

    if (existingJob) {
      const mergedKeywords = [
        ...new Set([...existingJob.keywords, ...newKeywords]),
      ];
      updateScrapeJob(prospectId, { keywords: mergedKeywords });
    } else {
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
    <div className={cn("relative inline-block", className)}>
      {/* Button */}
      <button
        onClick={handleOpen}
        className="px-3 py-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-white/80 text-sm font-medium transition-colors"
      >
        Suggest
      </button>

      {/* Simple Modal - NO PORTAL, NO ANIMATIONS */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="bg-gray-900 rounded-lg p-6 max-w-md w-[90vw] max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">
                AI Keyword Suggestions
              </h3>
              <button
                onClick={handleClose}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {generateKeywordsMutation.isPending ? (
                <div className="py-8 text-center">
                  <p className="text-white/70">Generating suggestions...</p>
                </div>
              ) : suggestedKeywords.length > 0 ? (
                <>
                  <p className="text-white/70 text-sm">
                    Select keywords to add to your scraping queue:
                  </p>

                  <div className="space-y-2">
                    {suggestedKeywords.map((keyword) => {
                      const isSelected = selectedKeywords.has(keyword);
                      const isExisting = existingKeywords.includes(keyword);

                      return (
                        <button
                          key={keyword}
                          onClick={() => !isExisting && toggleKeyword(keyword)}
                          disabled={isExisting}
                          className={cn(
                            "w-full p-3 rounded-lg flex items-center gap-3 transition-all text-left",
                            isExisting
                              ? "opacity-50 cursor-not-allowed bg-gray-800"
                              : isSelected
                              ? "bg-purple-500/20 border border-purple-500/50"
                              : "bg-gray-800 hover:bg-gray-700"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isExisting}
                            readOnly
                            className="pointer-events-none"
                          />
                          <span className="flex-1 text-white/90">
                            {keyword}
                          </span>
                          {isExisting && (
                            <span className="text-xs text-yellow-400">
                              Already exists
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 mt-6">
                    <LiquidButton
                      variant="primary"
                      size="sm"
                      onClick={handleAddToQueue}
                      disabled={selectedKeywords.size === 0}
                      className="flex-1"
                    >
                      Add {selectedKeywords.size || ""} New Words
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
                <div className="py-8 text-center">
                  <p className="text-white/70 text-sm">
                    No suggestions available at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
