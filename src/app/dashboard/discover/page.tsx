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
import { useAgent, useAgents } from "@/hooks/api/useAgentQueries";
import {
  useBrandQuery,
  useGenerateUseCaseInsight,
} from "@/hooks/api/useBrandQuery";

export default function UseCaseSummaryPage() {
  useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: brandResponse, isLoading, error, refetch } = useBrandQuery();
  const generateInsight = useGenerateUseCaseInsight();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(
    null
  );

  const brandData = brandResponse?.brand || null;

  // Calculate aggregated metrics across all prospects
  const metricState = brandData
    ? {
        totalPotentialCustomers:
          brandData.prospects?.reduce(
            (sum, p) => sum + (p.insights?.tag_counts?.potential_customer || 0),
            0
          ) || 0,
        totalCompetitorMentions:
          brandData.prospects?.reduce(
            (sum, p) => sum + (p.insights?.tag_counts?.competitor_mention || 0),
            0
          ) || 0,
        totalPosts:
          brandData.prospects?.reduce(
            (sum, p) => sum + (p.sourced_reddit_posts?.length || 0),
            0
          ) || 0,
      }
    : undefined;

  // Auto-select first prospect on mount if none selected
  useEffect(() => {
    if (brandData?.prospects?.length > 0 && !selectedProspect) {
      // Check if there's a prospect ID in URL params
      const prospectId = searchParams.get("prospect");
      if (prospectId) {
        const prospect = brandData.prospects.find((p) => p.id === prospectId);
        if (prospect) {
          setSelectedProspect(prospect);
          return;
        }
      }
      // Otherwise select the first prospect
      setSelectedProspect(brandData.prospects[0]);
    }
  }, [brandData?.prospects, selectedProspect, searchParams]);

  // Update URL when prospect changes
  useEffect(() => {
    if (selectedProspect) {
      const url = new URL(window.location.href);
      url.searchParams.set("prospect", selectedProspect.id);
      window.history.replaceState({}, "", url.toString());
    }
  }, [selectedProspect]);

  const handleUseCaseSelect = (useCase: Prospect | null) => {
    // Update local state instead of navigating
    setSelectedProspect(useCase);
  };

  const handleProspectSelect = (prospect: Prospect | null) => {
    setSelectedProspect(prospect);
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
        brandName={brandData.name}
        prospects={brandData.prospects}
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
            <BrandSummary brandData={brandData} metricState={metricState} />

            {/* HOLD FOR LATER */}

            {/* <OverviewInsights
              prospects={brandData?.prospects || []}
              brandId={brandData?.id || ""}
              prospectFunnelData={prospectFunnelData}
              isLoading={false}
            />
             */}
            <ProspectView
              prospects={brandData?.prospects || []}
              brandId={brandData?.id || ""}
              selectedProspect={selectedProspect}
              onProspectSelect={handleProspectSelect}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
