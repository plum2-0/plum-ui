"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TagListWithMore from "./TagListWithMore";
import QuickAddKeyword from "./QuickAddKeyword";
import { useBrand } from "@/contexts/BrandContext";
import {
  useDeleteProspectKeywords,
  useDeleteProspect,
} from "@/hooks/api/useBrandQuery";
import { useToast } from "@/components/ui/Toast";
import { PopoverWithPortal } from "@/components/ui/PopoverWithPortal";
import { LiquidButton } from "@/components/ui/LiquidButton";

interface ProspectAccordionProps {
  prospects: any;
}

// Helper function to format the refresh time
function formatRefreshTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60)
    return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  // For older dates, show the actual date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function ProspectAccordion({}: ProspectAccordionProps) {
  const { prospectsDisplay, brand } = useBrand();
  const deleteKeywordMutation = useDeleteProspectKeywords();
  const deleteProspectMutation = useDeleteProspect();
  const { showToast } = useToast();

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [deletingKeywords, setDeletingKeywords] = useState<Set<string>>(
    new Set()
  );
  const [confirmDeleteProspect, setConfirmDeleteProspect] = useState<
    string | null
  >(null);
  const [deletingProspects, setDeletingProspects] = useState<Set<string>>(
    new Set()
  );

  // Effect to open the first prospect by default
  useEffect(() => {
    if (prospectsDisplay && prospectsDisplay.length > 0) {
      const firstProspectId = prospectsDisplay[0].id;
      setExpandedItems((prev) => {
        // Only add the first prospect if no items are currently expanded
        if (prev.size === 0) {
          return new Set([firstProspectId]);
        }
        return prev;
      });
    }
  }, [prospectsDisplay]);

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDeleteKeyword = async (prospectId: string, keyword: string) => {
    if (!brand?.id) return;

    // Create unique key for this keyword deletion
    const deletionKey = `${prospectId}-${keyword}`;
    setDeletingKeywords((prev) => new Set(prev).add(deletionKey));

    try {
      await deleteKeywordMutation.mutateAsync({
        brandId: brand.id,
        prospectId,
        keywords: [keyword],
      });
      showToast({
        message: `Keyword "${keyword}" removed successfully`,
        type: "success",
      });
    } catch (error) {
      showToast({
        message: `Failed to remove keyword "${keyword}"`,
        type: "error",
      });
      console.error("Error deleting keyword:", error);
    } finally {
      setDeletingKeywords((prev) => {
        const newSet = new Set(prev);
        newSet.delete(deletionKey);
        return newSet;
      });
    }
  };

  const handleDeleteProspect = async (prospectId: string) => {
    if (!brand?.id) return;

    setDeletingProspects((prev) => new Set(prev).add(prospectId));
    setConfirmDeleteProspect(null);

    try {
      await deleteProspectMutation.mutateAsync({
        brandId: brand.id,
        prospectId,
      });

      // Remove from expanded items
      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(prospectId);
        return newSet;
      });

      showToast({
        message: "Prospect deleted successfully",
        type: "success",
      });
    } catch (error) {
      showToast({
        message: "Failed to delete prospect",
        type: "error",
      });
      console.error("Error deleting prospect:", error);

      // Remove from deleting set on error
      setDeletingProspects((prev) => {
        const newSet = new Set(prev);
        newSet.delete(prospectId);
        return newSet;
      });
    }
  };

  if (!prospectsDisplay || prospectsDisplay.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-white/70 font-body text-sm">
          No prospects available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prospectsDisplay.map((prospect) => {
        const isExpanded = expandedItems.has(prospect.id);
        const totalPosts =
          prospect.pendingPosts.length + prospect.actionedPosts.length;
        const actionedPercentage =
          totalPosts > 0
            ? (prospect.actionedPosts.length / totalPosts) * 100
            : 0;
        const isLoading = prospect.id.startsWith("temp-");
        const isDeleting = deletingProspects.has(prospect.id);

        return (
          <motion.div
            key={prospect.id}
            className="rounded-2xl overflow-hidden transition-all duration-300"
            animate={{
              opacity: isDeleting ? 0 : 1,
              scale: isDeleting ? 0.95 : 1,
              height: isDeleting ? 0 : "auto",
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            style={{
              background: `linear-gradient(135deg,
                rgba(255, 255, 255, 0.06) 0%,
                rgba(255, 255, 255, 0.02) 100%)`,
              backdropFilter: "blur(20px)",
              border: "1px solid transparent",
              backgroundImage: `
                linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02)),
                linear-gradient(135deg,
                  ${
                    isExpanded
                      ? "rgba(168, 85, 247, 0.3), rgba(34, 197, 94, 0.3)"
                      : "rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05)"
                  }
                )`,
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
              boxShadow: isExpanded
                ? "0 12px 48px rgba(0, 0, 0, 0.4), 0 0 80px rgba(168, 85, 247, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                : "0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
            whileHover={{
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.35), 0 0 60px rgba(168, 85, 247, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
            }}
          >
            {/* Liquid glass animated gradient overlay */}
            <motion.div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: `radial-gradient(
                  circle at 30% 50%,
                  rgba(168, 85, 247, 0.15) 0%,
                  transparent 50%
                ),
                radial-gradient(
                  circle at 70% 50%,
                  rgba(34, 197, 94, 0.15) 0%,
                  transparent 50%
                )`,
              }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Accordion Header */}
            <button
              onClick={() => !isLoading && toggleItem(prospect.id)}
              className="w-full p-5 relative group"
              disabled={isLoading}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 text-left">
                  <h3 className="heading-3 leading-tight line-clamp-1 mb-6 flex items-center gap-3">
                    {prospect.problem_to_solve}
                    {isLoading && (
                      <motion.div
                        className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs"
                        style={{
                          background: "rgba(168, 85, 247, 0.2)",
                          border: "1px solid rgba(168, 85, 247, 0.3)",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="w-2 h-2 rounded-full bg-purple-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span className="text-purple-300">Creating...</span>
                      </motion.div>
                    )}
                  </h3>

                  {/* Enhanced Metrics Bar */}
                  <div className="space-y-3">
                    {/* Numbers breakdown */}
                    <div className="flex justify-between items-center gap-4">
                      {/* Actioned - Enhanced */}
                      <PopoverWithPortal
                        trigger={
                          <div className="flex items-center gap-2 cursor-help">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                            <span className="text-white font-bold text-sm">
                              {prospect.actionedPosts.length}
                            </span>
                            <span className="text-green-300 text-xs font-semibold uppercase tracking-wide">
                              Engaged
                            </span>
                          </div>
                        }
                        side="top"
                        align="center"
                        openOnHover={true}
                      >
                        <span className="text-white/90 text-xs font-medium">
                          Posts we've already responded to
                        </span>
                      </PopoverWithPortal>

                      {/* Pending - Enhanced with matching dull yellow */}
                      <PopoverWithPortal
                        trigger={
                          <div className="flex items-center gap-2 cursor-help">
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-600 animate-pulse shadow-lg shadow-yellow-600/50" />
                            <span className="text-white font-bold text-sm">
                              {prospect.pendingPosts.length}
                            </span>
                            <span className="text-yellow-600 text-xs font-semibold uppercase tracking-wide">
                              To Review
                            </span>
                          </div>
                        }
                        side="top"
                        align="center"
                        openOnHover={true}
                      >
                        <span className="text-white/90 text-xs font-medium">
                          Posts waiting for your action
                        </span>
                      </PopoverWithPortal>
                    </div>

                    {/* Visual progress bar - thin style matching ProspectTargetsStat */}
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                        style={{ width: `${actionedPercentage}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${actionedPercentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>

                    {/* Progress percentage and posts analyzed */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400/60">
                          ({Math.round(actionedPercentage)}% complete)
                        </span>
                        <span className="text-white/40">•</span>
                        <span className="text-gray-400">
                          Analyzed {prospect.totalPostsScraped} posts to find
                          your ideal customers
                        </span>
                      </div>
                      {prospect.last_refresh_time && (
                        <span className="text-white/40">
                          Last refreshed:{" "}
                          {formatRefreshTime(prospect.last_refresh_time)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expand icon with glow */}
                <motion.div
                  className="relative flex-shrink-0 ml-4"
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      boxShadow:
                        "0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <svg
                      className="w-5 h-5 text-white/80"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </motion.div>
              </div>
            </button>

            {/* Accordion Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div
                    className="p-6 pt-2 space-y-6 border-t"
                    style={{
                      borderColor: "rgba(255, 255, 255, 0.08)",
                      background:
                        "linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, transparent 100%)",
                    }}
                  >
                    {/* Keywords Section */}
                    {prospect.keywordCounts.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.2))",
                              border: "1px solid rgba(168, 85, 247, 0.3)",
                              boxShadow:
                                "0 2px 8px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <svg
                              className="w-3.5 h-3.5 text-purple-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                          </div>
                          <h4 className="text-white/90 font-heading text-sm font-semibold">
                            Top Keywords
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <TagListWithMore
                            items={prospect.keywordCounts.map(
                              (item: { keyword: string; count: number }) => ({
                                key: `${prospect.id}-${item.keyword}`,
                                label: item.keyword,
                                count: item.count,
                                disabled: deletingKeywords.has(
                                  `${prospect.id}-${item.keyword}`
                                ),
                              })
                            )}
                            initialVisible={5}
                            variant="keyword"
                            showDelete={true}
                            onDeleteItem={(item) =>
                              handleDeleteKeyword(prospect.id, item.label)
                            }
                            trailingNode={
                              <QuickAddKeyword
                                prospectId={prospect.id}
                                problemToSolve={prospect.problem_to_solve}
                                existingKeywords={prospect.keywordCounts.map(
                                  (item: { keyword: string }) => item.keyword
                                )}
                                insights={prospect.insights}
                              />
                            }
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Subreddits Section */}
                    {prospect.subredditCounts.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />
                        <div className="flex items-center gap-2 mb-4">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))",
                              border: "1px solid rgba(34, 197, 94, 0.3)",
                              boxShadow:
                                "0 2px 8px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <svg
                              className="w-3.5 h-3.5 text-green-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                              />
                            </svg>
                          </div>
                          <h4 className="text-white/90 font-heading text-sm font-semibold">
                            Top Subreddits
                          </h4>
                        </div>
                        <TagListWithMore
                          items={prospect.subredditCounts.map(
                            (item: { subreddit: string; count: number }) => ({
                              key: `${prospect.id}-r/${item.subreddit}`,
                              label: `r/${item.subreddit}`,
                              count: item.count,
                            })
                          )}
                          initialVisible={5}
                          variant="subreddit"
                        />
                      </motion.div>
                    )}

                    {/* Insights Section */}
                    {prospect.insights && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />
                        <div className="flex items-center gap-2 mb-4">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))",
                              border: "1px solid rgba(59, 130, 246, 0.3)",
                              boxShadow:
                                "0 2px 8px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <svg
                              className="w-3.5 h-3.5 text-blue-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                              />
                            </svg>
                          </div>
                          <h4 className="text-white/90 font-heading text-sm font-semibold">
                            Insights
                          </h4>
                        </div>

                        <div className="space-y-4">
                          {/* General Summary */}
                          {prospect.insights.general_summary && (
                            <p className="text-white/80 font-body text-sm leading-relaxed">
                              {prospect.insights.general_summary}
                            </p>
                          )}

                          {/* Quick stats row */}
                          <div className="flex flex-wrap items-center gap-3">
                            {prospect.insights.willingness_to_pay && (
                              <span
                                className="px-3 py-1.5 rounded-full text-sm font-body"
                                style={{
                                  background: "rgba(59, 130, 246, 0.15)",
                                  border: "1px solid rgba(59, 130, 246, 0.3)",
                                }}
                              >
                                <span className="text-blue-300">
                                  Willingness to pay:
                                </span>
                                <span className="text-white/80 ml-1">
                                  {prospect.insights.willingness_to_pay}
                                </span>
                              </span>
                            )}

                            {prospect.insights.tag_counts && (
                              <span
                                className="px-3 py-1.5 rounded-full text-sm font-body"
                                style={{
                                  background: "rgba(16, 185, 129, 0.15)",
                                  border: "1px solid rgba(16, 185, 129, 0.3)",
                                }}
                              >
                                <span className="text-emerald-300">
                                  Potential customers:
                                </span>
                                <span className="text-white/80 ml-1">
                                  {
                                    prospect.insights.tag_counts
                                      .potential_customer
                                  }
                                </span>
                              </span>
                            )}

                            {prospect.insights.tag_counts && (
                              <span
                                className="px-3 py-1.5 rounded-full text-sm font-body"
                                style={{
                                  background: "rgba(234, 179, 8, 0.15)",
                                  border: "1px solid rgba(234, 179, 8, 0.3)",
                                }}
                              >
                                <span className="text-yellow-300">
                                  Competitor mentions:
                                </span>
                                <span className="text-white/80 ml-1">
                                  {
                                    prospect.insights.tag_counts
                                      .competitor_mention
                                  }
                                </span>
                              </span>
                            )}
                          </div>

                          {/* Identified Solutions */}
                          {Array.isArray(
                            prospect.insights.identified_solutions
                          ) &&
                            prospect.insights.identified_solutions.length >
                              0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <h5 className="text-white/80 font-heading text-xs font-semibold uppercase tracking-wide">
                                    Identified Solutions
                                  </h5>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                  {prospect.insights.identified_solutions
                                    .slice(0, 6)
                                    .map((solution: string, index: number) => (
                                      <span
                                        key={index}
                                        className="px-3 py-1.5 rounded-full text-sm font-body"
                                        style={{
                                          background:
                                            "rgba(255, 255, 255, 0.05)",
                                          border:
                                            "1px solid rgba(255, 255, 255, 0.1)",
                                        }}
                                      >
                                        <span className="text-white/70">
                                          {solution}
                                        </span>
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}

                          {/* Demographics */}
                          {Array.isArray(
                            prospect.insights.demographic_breakdown
                          ) &&
                            prospect.insights.demographic_breakdown.length >
                              0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <h5 className="text-white/80 font-heading text-xs font-semibold uppercase tracking-wide">
                                    Demographics
                                  </h5>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                  {prospect.insights.demographic_breakdown
                                    .slice(0, 8)
                                    .map((demo: string, index: number) => (
                                      <span
                                        key={index}
                                        className="px-3 py-1.5 rounded-full text-sm font-body"
                                        style={{
                                          background:
                                            "rgba(255, 255, 255, 0.05)",
                                          border:
                                            "1px solid rgba(255, 255, 255, 0.1)",
                                        }}
                                      >
                                        <span className="text-white/70">
                                          {demo}
                                        </span>
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}

                          {/* Top Competitors */}
                          {Array.isArray(prospect.insights.top_competitors) &&
                            prospect.insights.top_competitors.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <h5 className="text-white/80 font-heading text-xs font-semibold uppercase tracking-wide">
                                    Top Competitors
                                  </h5>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                  {prospect.insights.top_competitors
                                    .slice(0, 6)
                                    .map(
                                      (competitor: string, index: number) => (
                                        <span
                                          key={index}
                                          className="px-3 py-1.5 rounded-full text-sm font-body"
                                          style={{
                                            background:
                                              "rgba(255, 255, 255, 0.05)",
                                            border:
                                              "1px solid rgba(255, 255, 255, 0.1)",
                                          }}
                                        >
                                          <span className="text-white/70">
                                            {competitor}
                                          </span>
                                        </span>
                                      )
                                    )}
                                </div>
                              </div>
                            )}
                        </div>
                      </motion.div>
                    )}

                    {/* Settings with Danger Zone */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-8 pt-8 border-t flex justify-end"
                      style={{
                        borderColor: "rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <PopoverWithPortal
                        trigger={
                          <button
                            className="p-2 rounded-lg transition-all duration-200 group hover:bg-white/10"
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <svg
                              className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </button>
                        }
                        side="top"
                        align="end"
                      >
                        <div className="w-80 space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                            <svg
                              className="w-4 h-4 text-red-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            <h4 className="text-red-400 font-heading text-sm font-semibold">
                              Danger Zone
                            </h4>
                          </div>

                          <p className="text-white/70 text-sm">
                            Deleting this prospect will permanently remove all
                            associated data including scraped posts, keywords,
                            and insights. This action cannot be undone.
                          </p>
                          

                          {confirmDeleteProspect === prospect.id ? (
                            <div className="flex items-center gap-3">
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex-1"
                              >
                                <p className="text-red-400 text-sm font-semibold mb-3">
                                  Are you absolutely sure?
                                </p>
                                <div className="flex gap-2">
                                  <LiquidButton
                                    variant="danger"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteProspect(prospect.id)
                                    }
                                    disabled={isDeleting}
                                    className="flex items-center gap-2"
                                  >
                                    {isDeleting ? (
                                      <>
                                        <motion.div
                                          className="w-3 h-3 rounded-full bg-white/50"
                                          animate={{ opacity: [0.3, 1, 0.3] }}
                                          transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                          }}
                                        />
                                        <span>Deleting...</span>
                                      </>
                                    ) : (
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
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                        <span>Yes, Delete Prospect</span>
                                      </div>
                                    )}
                                  </LiquidButton>
                                  <LiquidButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={() =>
                                      setConfirmDeleteProspect(null)
                                    }
                                    disabled={isDeleting}
                                  >
                                    Cancel
                                  </LiquidButton>
                                </div>
                              </motion.div>
                            </div>
                          ) : (
                            <LiquidButton
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                setConfirmDeleteProspect(prospect.id)
                              }
                              shimmer={true}
                              className="w-full flex items-center justify-center gap-2"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                <span>Delete Prospect</span>
                              </div>
                            </LiquidButton>
                          )}
                        </div>
                      </PopoverWithPortal>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
