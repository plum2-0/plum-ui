"use client";

import React from "react";
import { motion } from "framer-motion";

type TagBadgeVariant = "keyword" | "subreddit";

interface TagBadgeProps {
  label: string;
  count?: number;
  variant?: TagBadgeVariant;
  showDelete?: boolean;
  disabled?: boolean;
  animationDelay?: number;
  className?: string;
  onDelete?: () => void;
}

export default function TagBadge({
  label,
  count,
  variant = "keyword",
  showDelete = false,
  disabled = false,
  animationDelay = 0,
  className = "",
  onDelete,
}: TagBadgeProps) {
  const isKeyword = variant === "keyword";

  const baseClasses = `group relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body backdrop-blur-md ${className}`;

  const styles = isKeyword
    ? {
        containerStyle: {
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
          opacity: disabled ? 0.5 : 1,
        } as React.CSSProperties,
        whileHover: {
          scale: 1.05,
          boxShadow:
            "0 4px 12px rgba(168, 85, 247, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        },
        labelClass: "text-purple-300 font-medium",
        countClass: "text-white/40",
      }
    : {
        containerStyle: {
          background:
            "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))",
          border: "1px solid transparent",
          backgroundImage: `
            linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08)),
            linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.2))
          `,
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          boxShadow:
            "0 2px 8px rgba(99, 102, 241, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          opacity: disabled ? 0.7 : 1,
        } as React.CSSProperties,
        whileHover: {
          scale: 1.05,
          boxShadow:
            "0 4px 12px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        },
        labelClass: "text-indigo-300 font-medium",
        countClass: "text-white/40 ml-1.5",
      };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    onDelete?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: animationDelay }}
      className={baseClasses}
      style={styles.containerStyle}
      whileHover={styles.whileHover}
      whileTap={{ scale: 0.98 }}
    >
      <span className={styles.labelClass}>{label}</span>
      {typeof count === "number" && (
        <span className={styles.countClass}>({count})</span>
      )}

      {showDelete && (
        <button
          type="button"
          onClick={handleDeleteClick}
          disabled={disabled}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-1 hover:text-red-400 disabled:cursor-not-allowed"
          title={`Remove "${label}"`}
          aria-label={`Remove ${label}`}
        >
          <svg
            className="w-3 h-3"
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
      )}
    </motion.div>
  );
}
