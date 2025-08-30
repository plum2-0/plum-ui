"use client";

import { useEffect, useState } from "react";

export function ValidationScoreCard() {
  const [ideasKilled, setIdeasKilled] = useState(47);
  const [winnersFound, setWinnersFound] = useState(3);
  const [timeSaved, setTimeSaved] = useState(6);
  const [moneySaved, setMoneySaved] = useState(127);

  // Animate counters on mount
  useEffect(() => {
    const interval = setInterval(() => {
      setIdeasKilled((prev) => prev + Math.floor(Math.random() * 3));
      setMoneySaved((prev) => prev + Math.floor(Math.random() * 5));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card rounded-3xl p-6 w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        {/* Ideas Killed */}
        <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">💀</span>
            <span className="text-sm font-semibold text-red-400 uppercase tracking-wider">
              Ideas Killed
            </span>
          </div>
          <div className="text-3xl font-bold text-white">
            {ideasKilled}
            <span className="text-sm font-normal text-white/60 ml-2">
              this week
            </span>
          </div>
        </div>

        {/* Winners Found */}
        <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🚀</span>
            <span className="text-sm font-semibold text-green-400 uppercase tracking-wider">
              Winners Found
            </span>
          </div>
          <div className="text-3xl font-bold text-white animate-pulse">
            {winnersFound}
          </div>
        </div>

        {/* Time Saved */}
        <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">⏱️</span>
            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
              Time Saved
            </span>
          </div>
          <div className="text-3xl font-bold text-white">
            {timeSaved}
            <span className="text-sm font-normal text-white/60 ml-2">
              months
            </span>
          </div>
        </div>

        {/* Money Saved */}
        <div className="text-center p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">💰</span>
            <span className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">
              Money Saved
            </span>
          </div>
          <div className="text-3xl font-bold text-white">
            ${moneySaved}K
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="mt-6 pt-4 border-t border-white/10 text-center">
        <p className="text-sm text-white/70">
          Real founders. Real validation. Real results.
        </p>
      </div>
    </div>
  );
}