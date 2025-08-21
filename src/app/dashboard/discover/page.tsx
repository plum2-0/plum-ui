"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Prospect } from "@/types/brand";
import DashboardSidebar from "@/components/dashboard2/DashboardSidebar";
import CenterDotsDivider from "@/components/ui/CenterDotsDivider";
import OverviewInsights from "@/components/dashboard2/OverviewInsights";
import AgentConversationDetail from "@/components/dashboard2/AgentConversationDetail";
import GenerateFirstAgent from "@/components/dashboard2/GenerateFirstAgent";
import BrandSummary from "@/components/dashboard2/BrandSummary";
import ProspectView from "@/components/dashboard2/ProspectView";
import { ProspectProvider, useProspect } from "@/contexts/ProspectContext";
import { KeywordQueueProvider } from "@/contexts/KeywordQueueContext";
import { BrandProvider, useBrand } from "@/contexts/BrandContext";
import { useAgent, useAgents } from "@/hooks/api/useAgentQueries";
import { useGenerateUseCaseInsight } from "@/hooks/api/useBrandQuery";

function UseCaseSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { brand: brandData, isLoading, error, refetch } = useBrand();
  const generateInsight = useGenerateUseCaseInsight();
  const { selectedProspect, setSelectedProspect } = useProspect();
  const [onlyUnread, setOnlyUnread] = useState(false);


  // Handle prospect selection from URL params
  useEffect(() => {
    if (brandData?.prospects && brandData.prospects.length > 0) {
      // Check if there's a prospect ID in URL params
      const prospectId = searchParams.get("prospect");
      if (prospectId) {
        const prospect = brandData.prospects.find((p) => p.id === prospectId);
        if (prospect) {
          setSelectedProspect(prospect);
        } else {
          // Invalid prospect ID, clear selection for summary view
          setSelectedProspect(null);
        }
      } else {
        // No prospect in URL means summary view
        setSelectedProspect(null);
      }
    }
  }, [brandData?.prospects, searchParams]);

  // Update URL when prospect changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedProspect) {
      url.searchParams.set("prospect", selectedProspect.id);
    } else {
      // Remove prospect param for summary view
      url.searchParams.delete("prospect");
    }
    window.history.replaceState({}, "", url.toString());
  }, [selectedProspect]);

  const handleUseCaseSelect = (useCase: Prospect | null) => {
    // Update local state instead of navigating
    setSelectedProspect(useCase);
  };

  const handleAddUseCase = async (title: string) => {
    if (!brandData) return Promise.resolve();

    const brandId = brandData.id;

    try {
      await generateInsight.mutateAsync({ brandId, title });

      const updatedBrand = await refetch();
      if (updatedBrand.data?.brand) {
        const created = updatedBrand.data.brand.prospects?.find(
          (prospect) =>
            prospect.problem_to_solve.trim().toLowerCase() ===
            title.trim().toLowerCase()
        );
        if (created) {
          router.push(`/dashboard/use-case/${created.id}`);
        }
      }
    } catch (e) {
      console.error(e);
    }

    return Promise.resolve();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-white text-xl font-body">
          Loading brand data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-300 text-xl font-body">
          Error: {error.message}
        </div>
      </div>
    );
  }

  if (!brandData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl font-body">No brand data found</div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden">
      <DashboardSidebar
        selectedUseCase={selectedProspect}
        onUseCaseSelect={handleUseCaseSelect}
        onlyUnread={onlyUnread}
        setOnlyUnread={setOnlyUnread}
        onAddUseCase={handleAddUseCase}
        inlineSelection={true}
      />

      <main className="flex-1 min-h-0 overflow-y-auto w-full">
        <div className="p-6">
          <div className="max-w-5xl mx-auto space-y-8">
            <BrandSummary />

            {/* HOLD FOR LATER */}

            {/* <OverviewInsights
              prospects={brandData?.prospects || []}
              brandId={brandData?.id || ""}
              prospectFunnelData={prospectFunnelData}
              isLoading={false}
            />
             */}
            <ProspectView />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function UseCaseSummaryPage() {
  useSession();

  return (
    <BrandProvider>
      <ProspectProvider>
        <KeywordQueueProvider>
          <UseCaseSummaryContent />
        </KeywordQueueProvider>
      </ProspectProvider>
    </BrandProvider>
  );
}
