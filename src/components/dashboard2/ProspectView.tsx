"use client";

import { useState } from "react";
import GlassPanel from "@/components/ui/GlassPanel";
import ViewToggle from "./ViewToggle";
import ResearchView from "./ResearchView";
import VizView from "./VizView";
import ResearchSummaryView from "./ResearchSummaryView";
import VizSummaryView from "./VizSummaryView";
import { useProspect } from "@/contexts/ProspectContext";
import { useBrand } from "@/contexts/BrandContext";
import { Prospect, Brand } from "@/types/brand";

// Shared glass panel styles
const glassPanelStyles = {
  background:
    "linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
  boxShadow:
    "0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
  backdropFilter: "blur(20px) saturate(1.2)",
  WebkitBackdropFilter: "blur(20px) saturate(1.2)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
};

// Individual Prospect View Component
function IndividualProspectView({
  prospect,
  brandId,
}: {
  prospect: Prospect;
  brandId: string;
}) {
  console.log("SHEEEprospect", prospect);
  const [currentView, setCurrentView] = useState<"research" | "viz">(
    "research"
  );

  return (
    <GlassPanel
      className="my-4 rounded-2xl overflow-hidden"
      variant="medium"
      style={glassPanelStyles}
    >
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
          <ResearchView prospect={prospect} brandId={brandId} />
        ) : (
          <VizView prospect={prospect} />
        )}
      </div>
    </GlassPanel>
  );
}

// Summary View Component (when no prospect selected)
function SummaryView({
  prospects,
  brandId,
  brandData,
}: {
  prospects: Prospect[];
  brandId: string;
  brandData: Brand;
}) {
  const [currentView, setCurrentView] = useState<"research" | "viz">(
    "research"
  );

  return (
    <GlassPanel
      className="rounded-2xl overflow-hidden"
      variant="medium"
      style={glassPanelStyles}
    >
      <div className="px-6 pt-6 pb-2">
        <div className="flex">
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
          <ResearchSummaryView
            prospects={prospects}
            brandId={brandId}
            brandData={brandData}
          />
        ) : (
          <VizSummaryView prospects={prospects} brandId={brandId} />
        )}
      </div>
    </GlassPanel>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <GlassPanel
      className="rounded-2xl p-8 text-center"
      variant="medium"
      style={glassPanelStyles}
    >
      <p className="text-white/70 font-body">
        No prospects available. Add a prospect from the sidebar to get started.
      </p>
    </GlassPanel>
  );
}

// Main ProspectView Component
export default function ProspectView() {
  const { brand: brandData } = useBrand();
  const { selectedProspect } = useProspect();

  if (!brandData) return null;

  const prospects = brandData.prospects || [];
  const brandId = brandData.id;

  // Render empty state
  if (prospects.length === 0) {
    return (
      <div className="space-y-2">
        <EmptyState />
      </div>
    );
  }

  // Render based on whether a prospect is selected
  return (
    <div className="space-y-2">
      {selectedProspect ? (
        <IndividualProspectView prospect={selectedProspect} brandId={brandId} />
      ) : (
        <SummaryView
          prospects={prospects}
          brandId={brandId}
          brandData={brandData}
        />
      )}
    </div>
  );
}
