"use client";

import { LiquidButton } from "@/components/ui/LiquidButton";

interface KeywordTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  onViewPosts?: (keyword: string) => void;
}

export default function KeywordTooltip({
  active,
  payload,
  label,
  onViewPosts,
}: KeywordTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const { fullName, total, difference, rank } = data;

  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: "rgba(17, 17, 27, 0.98)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(139, 92, 246, 0.2)",
        boxShadow:
          "0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 92, 246, 0.1)",
      }}
    >
      <div className="space-y-3">
        <div>
          <div className="text-white/90 font-semibold text-sm mb-1">
            {fullName}
          </div>
          <div className="text-white/60 text-xs">Rank #{rank}</div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white/70 text-xs">Posts:</span>
            <span className="text-white font-medium text-sm">{total}</span>
          </div>
          {difference > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">From top:</span>
              <span className="text-orange-400 text-sm">-{difference}</span>
            </div>
          )}
        </div>

        {onViewPosts && (
          <div className="pt-2 border-t border-white/10">
            <LiquidButton
              variant="primary"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onViewPosts(fullName);
              }}
            >
              View Posts
            </LiquidButton>
          </div>
        )}
      </div>
    </div>
  );
}