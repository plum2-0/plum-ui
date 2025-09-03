"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KeywordTagProps {
  keyword: string;
  isSelected: boolean;
  isProven?: boolean;
  engagementCount?: number;
  onClick: () => void;
}

export default function KeywordTag({
  keyword,
  isSelected,
  isProven = false,
  engagementCount = 0,
  onClick,
}: KeywordTagProps) {
  const hasEngagement = isProven && engagementCount > 0;

  const getTagStyles = () => {
    if (isSelected) {
      return {
        className: cn(
          "border transition-all",
          hasEngagement
            ? "text-emerald-400/60 border-emerald-500/40 hover:border-red-500/50"
            : "hover:border-red-500/50"
        ),
        style: {
          background: hasEngagement
            ? "linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(168, 85, 247, 0.25))"
            : "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(34, 197, 94, 0.3))",
          borderColor: hasEngagement
            ? "rgba(34, 197, 94, 0.4)"
            : "rgba(168, 85, 247, 0.5)",
          boxShadow: hasEngagement
            ? "0 0 12px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            : "0 0 15px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(10px)",
        },
        hoverShadow: hasEngagement
          ? "0 0 20px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
          : "0 0 25px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
      };
    }

    if (hasEngagement) {
      return {
        className: "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20",
        style: {},
        hoverShadow: "",
      };
    }

    return {
      className: "bg-white/5 hover:bg-white/10 border border-white/10",
      style: {},
      hoverShadow: "",
    };
  };

  const { className, style, hoverShadow } = getTagStyles();

  const textClassName = isSelected
    ? hasEngagement
      ? "text-emerald-400/60 font-medium"
      : "text-white font-medium"
    : hasEngagement
    ? "text-emerald-300/70"
    : "text-white/50";

  const textStyle = isSelected
    ? { textShadow: "0 0 8px rgba(255, 255, 255, 0.3)" }
    : undefined;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
    >
      <div
        onClick={onClick}
        className={cn(
          "px-2 py-0.5 text-xs rounded-full cursor-pointer flex items-center gap-1 relative overflow-hidden group",
          className
        )}
        style={style}
        onMouseEnter={(e) => {
          if (isSelected && hoverShadow) {
            e.currentTarget.style.boxShadow = hoverShadow;
          }
        }}
        onMouseLeave={(e) => {
          if (isSelected && style.boxShadow) {
            e.currentTarget.style.boxShadow = style.boxShadow;
          }
        }}
      >
        <span className={textClassName} style={textStyle}>
          {keyword}
        </span>
        <span className={isSelected ? "text-white/60" : "text-white/30"}>
          {isSelected ? "×" : "+"}
        </span>
      </div>
    </motion.div>
  );
}