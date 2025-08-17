"use client";

import { useState, useRef, useEffect } from "react";
import { Agent } from "@/types/agent";
import {
  useAgents,
  useDeleteAgent,
  useGenerateAgent,
} from "@/hooks/api/useAgentQueries";
import { useBrandQuery } from "@/hooks/api/useBrandQuery";
import { useRouter } from "next/navigation";
import AgentModal from "./AgentModal";
import Image from "next/image";

interface TeamAgentListProps {
  onAgentSelect?: (agentId: string) => void;
}

export default function TeamAgentList({ onAgentSelect }: TeamAgentListProps) {
  const router = useRouter();
  const { data: brandData } = useBrandQuery();
  const { data, isLoading, error } = useAgents();

  // Debug logging
  console.log("🔍 TeamAgentList - isLoading:", isLoading);
  console.log("🔍 TeamAgentList - error:", error);
  console.log("🔍 TeamAgentList - data:", data);
  const deleteAgent = useDeleteAgent();
  const generateAgent = useGenerateAgent();
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const agents = data?.agents || [];

  const handleAgentClick = (agentId: string, event: React.MouseEvent) => {
    // Don't navigate if clicking the delete button
    if ((event.target as HTMLElement).closest(".delete-button")) {
      return;
    }
    if (onAgentSelect) {
      onAgentSelect(agentId);
    } else {
      router.push(`/dashboard/team/${agentId}`);
    }
  };

  const handleDeleteAgent = async (
    agentId: string,
    agentName: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    if (
      !window.confirm(
        `Are you sure you want to delete ${agentName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingAgentId(agentId);
    try {
      await deleteAgent.mutateAsync(agentId);
    } catch (error) {
      console.error("Failed to delete agent:", error);
      alert("Failed to delete agent. Please try again.");
    } finally {
      setDeletingAgentId(null);
    }
  };

  const handleGenerateAgent = async () => {
    if (!brandData?.brand?.id) {
      alert("Brand ID not found. Please refresh and try again.");
      return;
    }

    setIsGenerating(true);
    try {
      await generateAgent.mutateAsync(brandData.brand.id);
    } catch (error) {
      console.error("Failed to generate agent:", error);
      alert("Failed to generate agent. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-32 flex items-center gap-4 px-6 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-72 h-28 rounded-2xl animate-pulse"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-32 flex items-center justify-center">
        <p className="text-red-400 font-body">Failed to load agents</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Scroll Buttons */}
      {agents.length > 3 && (
        <>
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Agent Cards Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-4 px-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          // Hide scrollbar in WebKit via CSS class if needed
        }}
      >
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={(e) => handleAgentClick(agent.id, e)}
            onMouseEnter={() => setHoveredAgent(agent.id)}
            onMouseLeave={() => setHoveredAgent(null)}
            className="shrink-0 snap-start w-72 h-28 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 relative overflow-hidden"
            style={{
              background:
                hoveredAgent === agent.id
                  ? "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(34, 197, 94, 0.15))"
                  : "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow:
                hoveredAgent === agent.id
                  ? "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                  : "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
              transform:
                hoveredAgent === agent.id
                  ? "translateY(-4px)"
                  : "translateY(0)",
            }}
          >
            {/* Status and Delete Button */}
            <div className="absolute top-2 right-2 flex items-center gap-2">
              {agent.isActive && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
              {hoveredAgent === agent.id && (
                <button
                  className="delete-button p-1 rounded-full transition-all duration-200 hover:scale-110"
                  onClick={(e) => handleDeleteAgent(agent.id, agent.name, e)}
                  disabled={deletingAgentId === agent.id}
                  style={{
                    background: "rgba(239, 68, 68, 0.2)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                  }}
                >
                  {deletingAgentId === agent.id ? (
                    <svg
                      className="w-4 h-4 text-white animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>

            <div className="flex items-start gap-3">
              {/* Avatar */}
              {agent.avatar ? (
                <Image
                  src={agent.avatar}
                  alt={agent.name}
                  width={48}
                  height={48}
                  className="rounded-full shrink-0"
                  style={{
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                  }}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(34, 197, 94, 0.8))",
                  }}
                >
                  {agent.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-heading font-semibold text-base truncate">
                  {agent.name}
                </h3>
                <p className="text-white/60 text-xs font-body mt-1 line-clamp-2">
                  {agent.persona.substring(0, 60)}...
                </p>

                {/* Quick Stats */}
                {hoveredAgent === agent.id && (
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-white/50 text-xs font-body">
                      Active conversations: 0
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Generate AI Agent Button */}
          <button
            onClick={handleGenerateAgent}
            disabled={isGenerating}
            className="shrink-0 snap-start w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              background:
                "linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(147, 51, 234, 0.4))",
              backdropFilter: "blur(15px)",
              border: "2px solid rgba(168, 85, 247, 0.5)",
              boxShadow: "0 8px 32px rgba(168, 85, 247, 0.2)",
              opacity: isGenerating ? 0.7 : 1,
            }}
            title="Generate AI Agent"
          >
            {isGenerating ? (
              <svg
                className="w-8 h-8 text-white animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>

          {/* Add Agent Button */}
          <button
            onClick={() => setIsCreating(true)}
            className="shrink-0 snap-start w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90"
            style={{
              background:
                "linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.3))",
              backdropFilter: "blur(15px)",
              border: "2px dashed rgba(34, 197, 94, 0.4)",
              boxShadow: "0 8px 32px rgba(34, 197, 94, 0.2)",
            }}
            title="Create Agent Manually"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Create Agent Modal */}
      <AgentModal isOpen={isCreating} onClose={() => setIsCreating(false)} />
    </div>
  );
}
