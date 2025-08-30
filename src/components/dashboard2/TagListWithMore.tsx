"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TagBadge from "./TagBadge";

type TagListVariant = "keyword" | "subreddit";

export interface TagListItem {
  key: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

interface TagListWithMoreProps {
  items: TagListItem[];
  initialVisible?: number;
  variant?: TagListVariant;
  showDelete?: boolean;
  onDeleteItem?: (item: TagListItem) => void;
  trailingNode?: React.ReactNode;
}

export default function TagListWithMore({
  items,
  initialVisible = 5,
  variant = "keyword",
  showDelete = false,
  onDeleteItem,
  trailingNode,
}: TagListWithMoreProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleItems = isExpanded ? items : items.slice(0, initialVisible);
  const hasMore = items.length > initialVisible;
  const remainingCount = items.length - initialVisible;

  const buttonStyles =
    variant === "subreddit"
      ? {
          className:
            "relative px-3 py-1.5 rounded-lg text-sm font-body text-green-300 hover:text-green-200 transition-all duration-300",
          style: {
            background:
              "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05))",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            boxShadow:
              "0 2px 8px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          } as React.CSSProperties,
          whileHover: {
            scale: 1.05,
            boxShadow:
              "0 4px 12px rgba(34, 197, 94, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
          },
          shimmerColor: "rgba(34, 197, 94, 0.15)",
        }
      : {
          className:
            "relative px-3 py-1.5 rounded-lg text-sm font-body text-purple-300 hover:text-purple-200 transition-all duration-300",
          style: {
            background:
              "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.05))",
            border: "1px solid rgba(168, 85, 247, 0.2)",
            boxShadow:
              "0 2px 8px rgba(168, 85, 247, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          } as React.CSSProperties,
          whileHover: {
            scale: 1.05,
            boxShadow:
              "0 4px 12px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
          },
          shimmerColor: "rgba(168, 85, 247, 0.15)",
        };

  return (
    <div className="relative">
      <motion.div
        className="flex flex-wrap gap-2 items-center"
        layout
        transition={{
          layout: { duration: 0.3, ease: "easeInOut" },
        }}
      >
        <AnimatePresence mode="popLayout">
          {visibleItems.map((item, index) => (
            <motion.div
              key={item.key}
              layout
              initial={
                index >= initialVisible
                  ? { opacity: 0, scale: 0.8, y: -10 }
                  : false
              }
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: {
                  duration: 0.3,
                  delay:
                    index >= initialVisible
                      ? (index - initialVisible) * 0.03
                      : 0,
                  ease: "easeOut",
                },
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
                y: -10,
                transition: {
                  duration: 0.2,
                  delay: (visibleItems.length - index - 1) * 0.02,
                },
              }}
            >
              <TagBadge
                label={item.label}
                count={item.count}
                variant={variant}
                showDelete={showDelete}
                disabled={item.disabled}
                animationDelay={index < initialVisible ? 0.05 * index : 0}
                onDelete={showDelete ? () => onDeleteItem?.(item) : undefined}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {hasMore && (
          <motion.button
            layout
            onClick={() => setIsExpanded(!isExpanded)}
            className={buttonStyles.className}
            style={buttonStyles.style}
            whileHover={buttonStyles.whileHover}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="flex items-center gap-1.5"
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <span>
                {isExpanded ? "Show Less" : `+${remainingCount} More`}
              </span>
              <motion.svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </motion.svg>
            </motion.div>

            {/* Shimmer effect on hover */}
            <motion.div
              className="absolute inset-0 rounded-lg opacity-0"
              style={{
                background: `linear-gradient(105deg, transparent 40%, ${buttonStyles.shimmerColor} 50%, transparent 60%)`,
              }}
              animate={{ opacity: [0, 1, 0], x: ["-100%", "200%"] }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 3,
              }}
            />
          </motion.button>
        )}

        {typeof trailingNode !== "undefined" && trailingNode}
      </motion.div>
    </div>
  );
}
