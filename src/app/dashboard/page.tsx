"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Problems } from "@/types/brand";
import DashboardSidebar from "@/components/dashboard2/DashboardSidebar";
import OverviewInsights from "@/components/dashboard2/OverviewInsights";
import AgentConversationDetail from "@/components/dashboard2/AgentConversationDetail";
import GenerateFirstAgent from "@/components/dashboard2/GenerateFirstAgent";
import { useAgent, useAgents } from "@/hooks/api/useAgentQueries";
import {
  useBrandQuery,
  useGenerateUseCaseInsight,
} from "@/hooks/api/useBrandQuery";

export default function DashboardPage() {
  useSession();
  const router = useRouter();
  const { data: brandResponse, isLoading, error, refetch } = useBrandQuery();
  const generateInsight = useGenerateUseCaseInsight();
  const [onlyUnread, setOnlyUnread] = useState(false);

  const { data: agentsList, isLoading: isAgentsLoading } = useAgents();
  const agents = agentsList?.agents || [];
  const firstAgent = agents?.[0];
  const { data: agent } = useAgent(firstAgent?.id || "");

  const brandData = brandResponse?.brand || null;

  const handleUseCaseSelect = (useCase: Problems | null) => {
    if (useCase) {
      // Navigate to specific use case
      router.push(`/dashboard/use-case/${useCase.id}`);
    }
    // If null, we're already on the summary page, do nothing
  };

  const handleAddUseCase = async (title: string) => {
    if (!brandData) return Promise.resolve();

    const brandId = brandData.id;

    try {
      // Generate insight and let React Query handle the refetch
      await generateInsight.mutateAsync({ brandId, title });

      // After successful generation, find and navigate to the new use case
      const updatedBrand = await refetch();
      if (updatedBrand.data?.brand) {
        const created = updatedBrand.data.brand.target_problems.find(
          (uc) => uc.problem.trim().toLowerCase() === title.trim().toLowerCase()
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
      {/* Sidebar - Desktop fixed, Mobile through wrapper */}
      <DashboardSidebar
        brandName={brandData.name}
        problems={brandData.target_problems}
        selectedUseCase={null}
        onUseCaseSelect={handleUseCaseSelect}
        onlyUnread={onlyUnread}
        setOnlyUnread={setOnlyUnread}
        onAddUseCase={handleAddUseCase}
      />

      {/* Scrollable Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto w-full">
        <div className="p-6">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Brand Summary Header */}
            <div className="pb-2">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-white font-heading text-3xl font-bold mb-2 tracking-tight">
                    {brandData.name}
                  </h1>
                  {brandData.detail && (
                    <p className="text-white/80 font-body text-base leading-relaxed">
                      {brandData.detail}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-6">
                    {brandData.website && (
                      <a
                        href={brandData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-body text-sm transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {/* Subtle bottom border */}
              <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>

            {/* Overview Insights Section (Collapsible) - Summary view */}
            <OverviewInsights
              problems={brandData?.target_problems || []}
              isLoading={false}
            />

            {/* Visual Separator */}
            <div className="relative py-4">
              <div
                className="h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="px-4 py-1 rounded-full"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-purple-400/50"></div>
                    <div className="w-1 h-1 rounded-full bg-emerald-400/50"></div>
                    <div className="w-1 h-1 rounded-full bg-indigo-400/50"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Conversation Detail - Always Display */}
            {isAgentsLoading ? (
              <div className="text-white/80 font-body text-center py-8">
                Loading agent conversation...
              </div>
            ) : agent ? (
              <div
                className="rounded-2xl overflow-hidden min-h-[50vh]"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow:
                    "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                }}
              >
                <div className="p-6 h-full overflow-y-auto">
                  <AgentConversationDetail
                    agent={agent}
                    onBack={() => {}} // No back action needed on main dashboard
                  />
                </div>
              </div>
            ) : (
              <div
                className="rounded-2xl overflow-hidden min-h-[20vh] flex items-center justify-center"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow:
                    "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                }}
              >
                <GenerateFirstAgent
                  message="No agents available. Generate your first AI agent to get started."
                  center
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
