"use client";

import { Prospect } from "@/types/brand";

interface VizViewProps {
  prospect: Prospect;
}

export default function VizView({ prospect }: VizViewProps) {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-heading font-bold text-white/80 mb-2">
          FUTURE DATA ANALYSIS
        </h3>
        <p className="text-white/50 font-body max-w-md mx-auto">
          Time series analytics and trend visualization coming soon
        </p>
      </div>
    </div>
  );
}