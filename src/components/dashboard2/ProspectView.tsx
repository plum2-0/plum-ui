"use client";

import { useState } from "react";
import { Prospect } from "@/types/brand";
import GlassPanel from "@/components/ui/GlassPanel";
import ProspectSelector from "./ProspectSelector";
import ViewToggle from "./ViewToggle";
import ResearchView from "./ResearchView";
import PostsView from "./PostsView";

interface ProspectViewProps {
  prospects: Prospect[];
  brandId: string;
  selectedProspect: Prospect | null;
  onProspectSelect: (prospect: Prospect | null) => void;
}

export default function ProspectView({
  prospects,
  brandId,
  selectedProspect,
  onProspectSelect,
}: ProspectViewProps) {
  const [currentView, setCurrentView] = useState<"research" | "posts">(
    "research"
  );

  return (
    <div className="space-y-6">
      {/* Future Data Analysis Placeholder */}
      <GlassPanel
        className="rounded-2xl p-8 min-h-[40vh] flex flex-col items-center justify-center"
        variant="medium"
        style={{
          background:
            "linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
          backdropFilter: "blur(20px) saturate(1.2)",
          WebkitBackdropFilter: "blur(20px) saturate(1.2)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
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
      </GlassPanel>

      {/* Prospect Controls */}
      {prospects.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <ProspectSelector
            prospects={prospects}
            selectedProspect={selectedProspect}
            onSelect={onProspectSelect}
            placeholder="Select a prospect to view details"
          />
          {selectedProspect && (
            <ViewToggle
              value={currentView}
              onChange={setCurrentView}
              options={[
                { key: "research", label: "Research" },
                { key: "posts", label: "Posts" },
              ]}
            />
          )}
        </div>
      )}

      {/* Dynamic Content Area */}
      {selectedProspect && (
        <GlassPanel
          className="rounded-2xl overflow-hidden"
          variant="medium"
          style={{
            background:
              "linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
            backdropFilter: "blur(20px) saturate(1.2)",
            WebkitBackdropFilter: "blur(20px) saturate(1.2)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <div className="p-6">
            {currentView === "research" ? (
              <ResearchView prospect={selectedProspect} />
            ) : (
              <PostsView prospect={selectedProspect} brandId={brandId} />
            )}
          </div>
        </GlassPanel>
      )}

      {/* Empty State */}
      {prospects.length === 0 && (
        <GlassPanel
          className="rounded-2xl p-8 text-center"
          variant="medium"
          style={{
            background:
              "linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
            backdropFilter: "blur(20px) saturate(1.2)",
            WebkitBackdropFilter: "blur(20px) saturate(1.2)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <p className="text-white/70 font-body">
            No prospects available. Add a prospect from the sidebar to get
            started.
          </p>
        </GlassPanel>
      )}
    </div>
  );
}
