"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Prospect } from "@/types/brand";
import DashboardSidebar from "@/components/dashboard2/DashboardSidebar";
import UseCaseInsightsPage from "@/components/dashboard2/UseCaseInsightsPage";
import RedditEngageSection from "@/components/dashboard2/RedditEngageSection";
import CenterDotsDivider from "@/components/ui/CenterDotsDivider";

import {
  useBrandQuery,
  useGenerateUseCaseInsight,
} from "@/hooks/api/useBrandQuery";

export default function UseCasePage() {
  useSession();
  const params = useParams();
  const router = useRouter();
  const useCaseId = params.id as string;

  const { data: brandResponse, isLoading, error, refetch } = useBrandQuery();
  const generateInsight = useGenerateUseCaseInsight();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [loadingUseCaseId, setLoadingUseCaseId] = useState<string | null>(null);

  const brandData = brandResponse?.brand || null;

  // Find the selected use case based on URL parameter
  const selectedProspectUsecase =
    brandData?.prospects.find((prospect) => prospect.id === useCaseId) || null;

  const handleUseCaseSelect = (useCase: Prospect | null) => {
    if (!useCase) {
      // Navigate to summary view
      router.push("/dashboard/engage");
    } else {
      // Navigate to specific use case
      router.push(`/dashboard/use-case/${useCase.id}`);
    }
  };

  const handleAddUseCase = async (title: string) => {
    if (!brandData) return Promise.resolve();

    const brandId = brandData.id;
    const tempId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());

    setLoadingUseCaseId(tempId);

    try {
      // Generate insight and let React Query handle the refetch
      await generateInsight.mutateAsync({ brandId, title });

      // After successful generation, find and navigate to the new use case
      const updatedBrand = await refetch();
      if (updatedBrand.data?.brand) {
        const created = updatedBrand.data.brand.prospects.find(
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
    } finally {
      setLoadingUseCaseId(null);
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

  // If use case not found, redirect to dashboard
  if (!selectedProspectUsecase) {
    router.push("/dashboard");
    return null;
  }

  const isSelectedUseCaseLoading =
    loadingUseCaseId === selectedProspectUsecase.id;

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar - Desktop fixed, Mobile through wrapper */}
      <DashboardSidebar
        brandName={brandData.name}
        prospects={brandData.prospects}
        selectedUseCase={selectedProspectUsecase}
        onUseCaseSelect={handleUseCaseSelect}
        onlyUnread={onlyUnread}
        setOnlyUnread={setOnlyUnread}
        onAddUseCase={handleAddUseCase}
      />

      {/* Scrollable Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Use Case Header */}
            <div className="pb-2">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-white/50 font-body text-sm mb-1 tracking-wide">
                    Problem
                  </p>
                  <h2 className="text-white/80 font-heading text-2xl font-bold mb-2 tracking-tight">
                    {selectedProspectUsecase.problem_to_solve}
                  </h2>
                  <p className="text-white/80 font-body text-base leading-relaxed">
                    {selectedProspectUsecase.insights?.general_summary ||
                      `Research insights and Reddit engagement opportunities`}
                  </p>
                </div>
              </div>
              {/* Subtle bottom border */}
              <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>

            {/* Use Case Insights Section (Collapsible) */}
            <UseCaseInsightsPage
              selectedUseCase={selectedProspectUsecase}
              isLoading={isSelectedUseCaseLoading}
            />

            {/* Visual Separator */}
            <CenterDotsDivider />

            {/* Reddit Engagement / Active Conversations - Enhanced Container */}
            <div
              className="rounded-2xl overflow-hidden min-h-[70vh]"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="p-6 h-full overflow-y-auto">
                <RedditEngageSection
                  selectedProblem={selectedProspectUsecase}
                  brandId={brandData?.id}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
