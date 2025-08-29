"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TagBadge from "./TagBadge";

interface SubredditsListProps {
  subredditCounts: { subreddit: string; count: number }[];
  initialVisible?: number;
}

export default function SubredditsList({ 
  subredditCounts, 
  initialVisible = 5 
}: SubredditsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const visibleItems = isExpanded ? subredditCounts : subredditCounts.slice(0, initialVisible);
  const hasMore = subredditCounts.length > initialVisible;
  const remainingCount = subredditCounts.length - initialVisible;

  return (
    <div className="relative">
      <motion.div 
        className="flex flex-wrap gap-2"
        layout
        transition={{
          layout: {
            duration: 0.3,
            ease: "easeInOut"
          }
        }}
      >
        <AnimatePresence mode="popLayout">
          {visibleItems.map((item, index) => (
            <motion.div
              key={item.subreddit}
              layout
              initial={index >= initialVisible ? { opacity: 0, scale: 0.8, y: -10 } : false}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: {
                  duration: 0.3,
                  delay: index >= initialVisible ? (index - initialVisible) * 0.03 : 0,
                  ease: "easeOut"
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.8,
                y: -10,
                transition: {
                  duration: 0.2,
                  delay: (visibleItems.length - index - 1) * 0.02
                }
              }}
            >
              <TagBadge
                label={`r/${item.subreddit}`}
                count={item.count}
                variant="subreddit"
                animationDelay={index < initialVisible ? 0.05 * index : 0}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {hasMore && (
          <motion.button
            layout
            onClick={() => setIsExpanded(!isExpanded)}
            className="relative px-3 py-1.5 rounded-lg text-sm font-body text-green-300 hover:text-green-200 transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05))",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              boxShadow: "0 2px 8px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 4px 12px rgba(34, 197, 94, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="flex items-center gap-1.5"
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <span>{isExpanded ? "Show Less" : `+${remainingCount} More`}</span>
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
                background: "linear-gradient(105deg, transparent 40%, rgba(34, 197, 94, 0.15) 50%, transparent 60%)",
              }}
              animate={{
                opacity: [0, 1, 0],
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 3,
              }}
            />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}