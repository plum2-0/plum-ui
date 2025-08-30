"use client";

import { useEffect, useState } from "react";

interface TruthMeterProps {
  score?: number;
  animated?: boolean;
}

export function TruthMeter({ score = 0, animated = true }: TruthMeterProps) {
  const [currentScore, setCurrentScore] = useState(animated ? 0 : score);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setCurrentScore(score);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [score, animated]);

  const getColorClass = () => {
    if (currentScore < 20) return "from-red-600 to-red-500";
    if (currentScore < 40) return "from-orange-600 to-orange-500";
    if (currentScore < 60) return "from-yellow-600 to-yellow-500";
    if (currentScore < 80) return "from-green-500 to-green-400";
    return "from-green-400 to-emerald-400";
  };

  const getMessage = () => {
    if (currentScore < 20) return "💀 Nobody wants this";
    if (currentScore < 40) return "⚠️ Needs major pivot";
    if (currentScore < 60) return "🤔 Has potential";
    if (currentScore < 80) return "✨ Strong interest";
    return "🚀 HOLY SH*T BUILD THIS NOW";
  };

  const getTextColor = () => {
    if (currentScore < 20) return "text-red-400";
    if (currentScore < 40) return "text-orange-400";
    if (currentScore < 60) return "text-yellow-400";
    if (currentScore < 80) return "text-green-400";
    return "text-green-300";
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          Truth Meter™
        </span>
        <span className={`text-2xl font-bold ${getTextColor()}`}>
          {currentScore}%
        </span>
      </div>

      {/* Meter Bar */}
      <div className="relative h-8 bg-black/40 rounded-full overflow-hidden border border-white/20">
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getColorClass()} transition-all duration-1000 ease-out`}
          style={{ width: `${currentScore}%` }}
        >
          <div className="absolute inset-0 opacity-50">
            <div className="h-full w-full bg-gradient-to-t from-transparent to-white/20"></div>
          </div>
        </div>

        {/* Glow effect */}
        {currentScore > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white blur-md"
            style={{ left: `calc(${currentScore}% - 8px)` }}
          />
        )}
      </div>

      {/* Message */}
      <div className={`mt-3 text-center font-bold ${getTextColor()}`}>
        {getMessage()}
      </div>

      {/* Scale indicators */}
      <div className="mt-2 flex justify-between text-xs text-white/40">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
