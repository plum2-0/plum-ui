"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBrand } from "@/contexts/BrandContext";

interface ProspectAccordionProps {
  prospects: any; // Accept the raw Prospect[] from parent
}

export default function ProspectAccordion({}: ProspectAccordionProps) {
  // Always use the transformed data from context
  const { prospectsDisplay } = useBrand();

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

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

        return (
          <motion.div
            key={prospect.id}
            className="rounded-2xl overflow-hidden transition-all duration-300"
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
              onClick={() => toggleItem(prospect.id)}
              className="w-full p-5 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 text-left">
                  <h3 className="heading-3 leading-tight line-clamp-1 mb-3">
                    {prospect.problem_to_solve}
                  </h3>

                  {/* Enhanced Metrics Bar */}
                  <div className="relative">
                    {/* Progress bar background */}
                    <div
                      className="h-12 rounded-xl overflow-hidden"
                      style={{
                        background: "rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      {/* Actioned fill */}
                      <motion.div
                        className="h-full relative overflow-hidden"
                        style={{
                          width: `${actionedPercentage}%`,
                          background: `linear-gradient(90deg,
                            rgba(34, 197, 94, 0.8) 0%,
                            rgba(16, 185, 129, 0.8) 100%)`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${actionedPercentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      >
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                            transform: "translateX(-100%)",
                          }}
                          animate={{
                            transform: [
                              "translateX(-100%)",
                              "translateX(200%)",
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                          }}
                        />
                      </motion.div>

                      {/* Metrics overlay */}
                      <div className="absolute inset-0 flex items-center justify-between px-4">
                        {/* Actioned */}
                        <motion.div
                          className="flex items-center gap-2 z-10"
                          onHoverStart={() => setHoveredMetric("actioned")}
                          onHoverEnd={() => setHoveredMetric(null)}
                        >
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-white font-semibold text-sm">
                            {prospect.actionedPosts.length}
                          </span>
                          <span className="text-green-300 text-xs font-medium">
                            Actioned
                          </span>
                        </motion.div>

                        {/* Pending */}
                        <motion.div
                          className="flex items-center gap-2 z-10"
                          onHoverStart={() => setHoveredMetric("pending")}
                          onHoverEnd={() => setHoveredMetric(null)}
                        >
                          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                          <span className="text-white font-semibold text-sm">
                            {prospect.pendingPosts.length}
                          </span>
                          <span className="text-yellow-300 text-xs font-medium">
                            Pending
                          </span>
                        </motion.div>

                        {/* Potential */}
                        <motion.div
                          className="flex items-center gap-2 z-10"
                          onHoverStart={() => setHoveredMetric("potential")}
                          onHoverEnd={() => setHoveredMetric(null)}
                        >
                          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                          <span className="text-white font-semibold text-sm">
                            {prospect.totalPotentialCustomers}
                          </span>
                          <span className="text-purple-300 text-xs font-medium">
                            Potential
                          </span>
                        </motion.div>
                      </div>
                    </div>

                    {/* Hover tooltip */}
                    <AnimatePresence>
                      {hoveredMetric && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: -45 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 right-0 mx-auto w-fit px-3 py-1.5 rounded-lg pointer-events-none"
                          style={{
                            background: "rgba(0, 0, 0, 0.9)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          <span className="text-white/90 text-xs font-medium">
                            {hoveredMetric === "actioned" &&
                              "Posts we've already responded to"}
                            {hoveredMetric === "pending" &&
                              "Posts waiting for your action"}
                            {hoveredMetric === "potential" &&
                              "Total customers interested in this topic"}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.2))",
                              border: "1px solid rgba(168, 85, 247, 0.3)",
                              boxShadow:
                                "0 2px 8px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <svg
                              className="w-4 h-4 text-purple-300"
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
                          <h4 className="text-white/90 font-heading text-base font-semibold">
                            Top Keywords
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {prospect.keywordCounts
                            .slice(0, 5)
                            .map(
                              (
                                item: { keyword: string; count: number },
                                index: number
                              ) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.05 * index }}
                                  className="px-4 py-2 rounded-full text-sm font-body backdrop-blur-md"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(147, 51, 234, 0.1))",
                                    border: "1px solid transparent",
                                    backgroundImage: `
                                      linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(147, 51, 234, 0.1)),
                                      linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(147, 51, 234, 0.3))
                                    `,
                                    backgroundOrigin: "border-box",
                                    backgroundClip: "padding-box, border-box",
                                    boxShadow:
                                      "0 2px 8px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                                  }}
                                  whileHover={{
                                    scale: 1.05,
                                    boxShadow:
                                      "0 4px 12px rgba(168, 85, 247, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                                  }}
                                >
                                  <span className="text-purple-300 font-medium">
                                    {item.keyword}
                                  </span>
                                  <span className="text-white/40 ml-1.5">
                                    ({item.count})
                                  </span>
                                </motion.div>
                              )
                            )}
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
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))",
                              border: "1px solid rgba(34, 197, 94, 0.3)",
                              boxShadow:
                                "0 2px 8px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <svg
                              className="w-4 h-4 text-green-300"
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
                          <h4 className="text-white/90 font-heading text-base font-semibold">
                            Top Subreddits
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {prospect.subredditCounts
                            .slice(0, 5)
                            .map(
                              (
                                item: { subreddit: string; count: number },
                                index: number
                              ) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.05 * index }}
                                  className="px-4 py-2 rounded-full text-sm font-body backdrop-blur-md"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))",
                                    border: "1px solid transparent",
                                    backgroundImage: `
                                      linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1)),
                                      linear-gradient(135deg, rgba(34, 197, 94, 0.4), rgba(16, 185, 129, 0.3))
                                    `,
                                    backgroundOrigin: "border-box",
                                    backgroundClip: "padding-box, border-box",
                                    boxShadow:
                                      "0 2px 8px rgba(34, 197, 94, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                                  }}
                                  whileHover={{
                                    scale: 1.05,
                                    boxShadow:
                                      "0 4px 12px rgba(34, 197, 94, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                                  }}
                                >
                                  <span className="text-green-300 font-medium">
                                    r/{item.subreddit}
                                  </span>
                                  <span className="text-white/40 ml-1.5">
                                    ({item.count})
                                  </span>
                                </motion.div>
                              )
                            )}
                        </div>
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
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))",
                              border: "1px solid rgba(59, 130, 246, 0.3)",
                              boxShadow:
                                "0 2px 8px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <svg
                              className="w-4 h-4 text-blue-300"
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
                          <h4 className="text-white/90 font-heading text-base font-semibold">
                            Insights
                          </h4>
                        </div>

                        <div className="space-y-4">
                          {/* General Summary */}
                          {prospect.insights.general_summary && (
                            <p className="text-white/80 font-body text-base leading-relaxed">
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
                                  <span className="icon-badge">
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
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </span>
                                  <h5 className="text-white/80 font-heading text-sm font-semibold">
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
                                            "rgba(147, 51, 234, 0.15)",
                                          border:
                                            "1px solid rgba(147, 51, 234, 0.3)",
                                        }}
                                      >
                                        <span className="text-purple-300">
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
                                  <span className="icon-badge">
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
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M7 8a4 4 0 118 0 4 4 0 01-8 0z"
                                      />
                                    </svg>
                                  </span>
                                  <h5 className="text-white/80 font-heading text-sm font-semibold">
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
                                            "rgba(59, 130, 246, 0.15)",
                                          border:
                                            "1px solid rgba(59, 130, 246, 0.3)",
                                        }}
                                      >
                                        <span className="text-blue-300">
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
                                  <span className="icon-badge">
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
                                        d="M9 17v-6h13M9 17H5a2 2 0 01-2-2V7a2 2 0 012-2h4m0 12l4-4m0 0l-4-4m4 4H3"
                                      />
                                    </svg>
                                  </span>
                                  <h5 className="text-white/80 font-heading text-sm font-semibold">
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
                                              "rgba(234, 179, 8, 0.15)",
                                            border:
                                              "1px solid rgba(234, 179, 8, 0.3)",
                                          }}
                                        >
                                          <span className="text-yellow-300">
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
