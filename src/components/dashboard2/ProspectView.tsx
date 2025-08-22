"use client";

import { useState } from "react";
import GlassPanel from "@/components/ui/GlassPanel";
import ViewToggle from "./ViewToggle";
import CombinedResearchView from "./ResearchView";
import VizView from "./VizView";
import CombinedResearchSummaryView from "./ResearchSummaryView";
import VizSummaryView from "./VizSummaryView";
import { useProspect } from "@/contexts/ProspectContext";
import { useBrand } from "@/contexts/BrandContext";

export default function ProspectView() {
  const { brand: brandData } = useBrand();
  const { selectedProspect } = useProspect();

  if (!brandData) return null;

  const prospects = brandData.prospects || [];
  const brandId = brandData.id;
  const [currentView, setCurrentView] = useState<"research" | "viz">(
    "research"
  );

  return (
    <div className="space-y-2">
      {/* View Toggle - Show for both individual prospect and summary view */}

      {/* Dynamic Content Area */}
      {selectedProspect && (
        <GlassPanel
          className="my-4 rounded-2xl overflow-hidden"
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
          {/* ViewToggle with proper spacing */}
          <div className="px-6 pt-4 pb-2">
            <div className="flex mb-4">
              <ViewToggle
                value={currentView}
                onChange={setCurrentView}
                options={[
                  { key: "research", label: "Research" },
                  { key: "viz", label: "Viz" },
                ]}
              />
            </div>
          </div>

          <div className="px-6 pb-6">
            {currentView === "research" ? (
              <CombinedResearchView
                prospect={selectedProspect}
                brandId={brandId}
                brandData={brandData}
              />
            ) : (
              <VizView prospect={selectedProspect} />
            )}
          </div>
        </GlassPanel>
      )}

      {/* Summary View - when no prospect selected */}
      {!selectedProspect && prospects.length > 0 && (
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
          {/* ViewToggle with proper spacing */}
          <div className="px-6 pt-6 pb-2">
            <div className="flex justify-center">
              <ViewToggle
                value={currentView}
                onChange={setCurrentView}
                options={[
                  { key: "research", label: "Research" },
                  { key: "viz", label: "Viz" },
                ]}
              />
            </div>
          </div>

          <div className="px-6 pb-6">
            {currentView === "research" ? (
              <CombinedResearchSummaryView
                prospects={prospects}
                brandId={brandId}
                brandData={brandData}
              />
            ) : (
              <VizSummaryView prospects={prospects} brandId={brandId} />
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
