"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CenterDotsDividerProps {
  className?: string;
  lineClassName?: string;
  overlayClassName?: string;
}

export const CenterDotsDivider: React.FC<CenterDotsDividerProps> = ({
  className,
  lineClassName,
  overlayClassName,
}) => {
  return (
    <div className={cn("relative py-4", className)}>
      <div
        className={cn("h-px", lineClassName)}
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn("px-4 py-1 rounded-full", overlayClassName)}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-purple-400/50"></div>
            <div className="w-1 h-1 rounded-full bg-emerald-400/50"></div>
            <div className="w-1 h-1 rounded-full bg-indigo-400/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterDotsDivider;
