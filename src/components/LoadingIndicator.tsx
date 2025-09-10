"use client";

import React from "react";

type LoadingIndicatorProps = {
  primaryText?: React.ReactNode;
  secondaryText?: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

const sizeClassByToken: Record<
  NonNullable<LoadingIndicatorProps["size"]>,
  string
> = {
  sm: "w-10 h-10",
  md: "w-16 h-16",
  lg: "w-20 h-20",
};

export default function LoadingIndicator({
  primaryText = "Warming up the bots…",
  secondaryText = "sorry our Python cold start is hella slow, give it a sec",
  size = "lg",
}: LoadingIndicatorProps) {
  const spinnerSizeClass = sizeClassByToken[size];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div
          className={`${spinnerSizeClass} rounded-full border-4 border-purple-400/30 border-t-purple-300 animate-spin`}
        ></div>
        <div className="absolute inset-0 rounded-full blur-md bg-purple-500/20 animate-pulse"></div>
      </div>
      <div className="text-center space-y-1">
        <div className="text-white text-xl font-semibold">{primaryText}</div>
        {secondaryText ? (
          <div className="text-white/80 text-sm">{secondaryText}</div>
        ) : null}
      </div>
    </div>
  );
}
