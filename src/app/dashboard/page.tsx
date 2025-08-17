"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Problems } from "@/types/brand";
import DashboardSidebar from "@/components/dashboard2/DashboardSidebar";
import MarketInsightsSection from "@/components/dashboard2/MarketInsightsSection";
import RedditEngageSection from "@/components/dashboard2/RedditEngageSection";
import AgentConversationDetail from "@/components/dashboard2/AgentConversationDetail";
import { useAgent, useAgents } from "@/hooks/api/useAgentQueries";
import { AgentDetails } from "@/types/agent";
import {
  useBrandQuery,
  useGenerateUseCaseInsight,
} from "@/hooks/api/useBrandQuery";

export default function Dashboard2Page() {
  useSession();
  const { data: brandResponse, isLoading, error, refetch } = useBrandQuery();
  const generateInsight = useGenerateUseCaseInsight();
  const [selectedUseCase, setSelectedUseCase] = useState<Problems | null>(null);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [loadingUseCaseId, setLoadingUseCaseId] = useState<string | null>(null);
  const [conversationView, setConversationView] = useState<"all" | "active">(
    "all"
  );
  const { data: agentsList, isLoading: isAgentsLoading } = useAgents();
  const agents = agentsList?.agents || [];
  let firstAgent;
  if (agents?.length) {
    firstAgent = agents[0];
  }

  const { data: agent } = useAgent(firstAgent?.id || "");

  const brandData = brandResponse?.brand || null;

  // No posts filters needed when showing insights-only view

  // Set initial selected use case when brand data loads
  useState(() => {
    if (brandData && !selectedUseCase) {
      // Default to Total (no specific use case selected)
      setSelectedUseCase(null);
    }
  });

  const handleAddUseCase = async (title: string) => {
    if (!brandData) return Promise.resolve();

    const brandId = brandData.id;
    const tempId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());

    const tempUseCase: Problems = {
      id: tempId,
      title,
      description: "",
      hot_features_summary: null,
      competitor_summary: null,
      created_at: new Date().toISOString(),
      brand_id: brandId,
      subreddit_posts: [],
      // insights intentionally undefined while loading
    } as unknown as Problems;

    // Optimistically select the temp use case
    setSelectedUseCase(tempUseCase);
    setLoadingUseCaseId(tempId);

    try {
      // Generate insight and let React Query handle the refetch
      await generateInsight.mutateAsync({ brandId, title });

      // After successful generation, find and select the new use case
      const updatedBrand = await refetch();
      if (updatedBrand.data?.brand) {
        const created = updatedBrand.data.brand.target_problems.find(
          (uc) => uc.problem.trim().toLowerCase() === title.trim().toLowerCase()
        );
        if (created) {
          setSelectedUseCase(created);
        }
      }
    } catch (e) {
      console.error(e);
      // On failure, reset selection
      setSelectedUseCase(() => {
        const first = brandData?.target_problems[0];
        return first ?? null;
      });
    } finally {
      setLoadingUseCaseId(null);
    }

    return Promise.resolve();
  };

  console.log(JSON.stringify(agent, null, 2));

  // No tab state to manage in insights-only view

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

  // Posts list and filters removed for insights-only view

  const isSelectedUseCaseLoading =
    selectedUseCase && loadingUseCaseId === selectedUseCase.id;

  return (
    <div className="h-full flex overflow-hidden">
      {/* Fixed Sidebar with existing styling */}
      <div className="w-64 shrink-0">
        <DashboardSidebar
          brandName={brandData.name}
          problems={brandData.target_problems}
          selectedUseCase={selectedUseCase}
          onUseCaseSelect={setSelectedUseCase}
          onlyUnread={onlyUnread}
          setOnlyUnread={setOnlyUnread}
          onAddUseCase={handleAddUseCase}
        />
      </div>

      {/* Scrollable Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Brand/Use Case Header - Clean without container */}
            <div className="pb-2">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  {selectedUseCase && (
                    <p className="text-white/50 font-body text-sm mb-1 tracking-wide">
                      Problem
                    </p>
                  )}
                  <h1 className="text-white font-heading text-3xl font-bold mb-2 tracking-tight">
                    {selectedUseCase ? selectedUseCase.problem : brandData.name}
                  </h1>
                  {selectedUseCase ? (
                    <p className="text-white/80 font-body text-base leading-relaxed">
                      {selectedUseCase.insights?.general_summary ||
                        `Research insights and Reddit engagement opportunities`}
                    </p>
                  ) : (
                    brandData.detail && (
                      <p className="text-white/80 font-body text-base leading-relaxed">
                        {brandData.detail}
                      </p>
                    )
                  )}
                  {!selectedUseCase && (
                    <div className="mt-4 flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-white/60 font-body text-sm">
                          Use Cases:
                        </span>
                        <span className="text-purple-300 font-heading font-bold text-lg">
                          {brandData.target_problems.length}
                        </span>
                      </div>
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
                  )}
                </div>
              </div>
              {/* Subtle bottom border */}
              <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>

            {/* Market Insights Section (Collapsible) */}
            <MarketInsightsSection
              selectedUseCase={selectedUseCase}
              problems={brandData?.target_problems || []}
              isLoading={isSelectedUseCaseLoading || false}
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

            {/* Conversations View Toggle */}
            <div className="flex items-center">
              <div
                className="ml-auto flex items-center gap-1 p-1 rounded-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <button
                  onClick={() => setConversationView("all")}
                  className={`px-3 py-1.5 rounded-md text-xs font-body transition-all ${
                    conversationView === "all"
                      ? "text-white bg-white/15"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setConversationView("active")}
                  className={`px-3 py-1.5 rounded-md text-xs font-body transition-all ${
                    conversationView === "active"
                      ? "text-white bg-white/15"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Active
                </button>
              </div>
            </div>

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
                {conversationView === "all" ? (
                  <RedditEngageSection
                    selectedProblem={selectedUseCase}
                    brandId={brandData?.id}
                  />
                ) : isAgentsLoading ? (
                  <div className="text-white/80 font-body">
                    Loading active conversations...
                  </div>
                ) : agent ? (
                  <AgentConversationDetail
                    agent={agent}
                    onBack={() => setConversationView("all")}
                  />
                ) : (
                  <div className="text-white/60 font-body">
                    No agents available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
