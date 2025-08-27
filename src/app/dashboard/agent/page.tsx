"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useBrandQuery } from "@/hooks/api/useBrandQuery";
import {
  useAgent,
  useDeleteAgent,
  useUpdateAgent,
} from "@/hooks/api/useAgentQueries";
import TeamAgentList from "@/components/team/TeamAgentList";
import AgentTester from "@/components/agent-testing/AgentTester";
import GlassPanel from "@/components/ui/GlassPanel";

export default function AgentPage() {
  const { status } = useSession();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isAgentListExpanded, setIsAgentListExpanded] = useState(false);

  // Fetch selected agent data - always call the hook, use enabled option to control execution
  const { data: agent, isLoading: agentIsLoading } = useAgent(
    selectedAgentId || "",
    {
      enabled: !!selectedAgentId,
    }
  );

  // Debug logging for agent data
  const deleteAgent = useDeleteAgent();
  const updateAgent = useUpdateAgent();

  // Local state for persona and goal
  const [localPersona, setLocalPersona] = useState("");
  const [localGoal, setLocalGoal] = useState("");

  const handleDelete = async () => {
    if (!selectedAgentId) return;
    if (
      !window.confirm(
        "Are you sure you want to delete this agent? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAgent.mutateAsync(selectedAgentId);
      setSelectedAgentId(null);
    } catch (error) {
      console.error("Failed to delete agent:", error);
      alert("Failed to delete agent. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Show loading state while session or brand data is loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-white text-xl font-body">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-heading font-bold text-white mb-1">
            Agent Management
          </h1>
          <p className="text-white/60 text-sm font-body">
            Manage and test your Reddit agents
          </p>
        </div>

        {/* Collapsible Agent List */}
        <div>
          <button
            onClick={() => setIsAgentListExpanded(!isAgentListExpanded)}
            className="mb-4 px-4 py-2 rounded-xl font-body text-white transition-all duration-300 hover:scale-105 flex items-center gap-2"
            style={{
              background:
                "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(34, 197, 94, 0.15))",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow:
                "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${
                isAgentListExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <span className="font-semibold">Agents</span>
          </button>

          {/* Animated collapse/expand */}
          <div
            className="overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              maxHeight: isAgentListExpanded ? "200px" : "0px",
              opacity: isAgentListExpanded ? 1 : 0,
            }}
          >
            <TeamAgentList
              onAgentSelect={setSelectedAgentId}
              selectedAgentId={selectedAgentId}
            />
          </div>
        </div>

        {/* Agent Detail View */}
        {selectedAgentId && (agentIsLoading || !agent) ? (
          <div className="space-y-6">
            {/* Agent Loading Skeleton */}
            <div
              className="rounded-2xl p-6"
              style={{
                background:
                  "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(34, 197, 94, 0.1))",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Avatar Skeleton */}
                  <div
                    className="w-16 h-16 rounded-full shrink-0 animate-pulse"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(34, 197, 94, 0.3))",
                    }}
                  />

                  {/* Info Skeleton */}
                  <div className="space-y-2">
                    <div className="h-8 w-48 bg-white/20 rounded-lg animate-pulse" />
                    <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                    <div className="flex items-center gap-4 mt-3">
                      <div className="h-6 w-16 bg-white/10 rounded-full animate-pulse" />
                      <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Actions Skeleton */}
                <div className="flex items-center gap-2">
                  <div className="h-10 w-16 bg-white/10 rounded-xl animate-pulse" />
                  <div className="h-10 w-20 bg-white/10 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>

            {/* Metrics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(15px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <div className="h-3 w-20 bg-white/20 rounded animate-pulse mb-2" />
                  <div className="h-8 w-12 bg-white/30 rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Persona & Goal Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl p-5"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <div className="h-6 w-20 bg-white/30 rounded animate-pulse mb-3" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-white/20 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-white/20 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-white/20 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : selectedAgentId && agent ? (
          <div className="space-y-6">
            {/* Agent Header - Fluid Design */}
            <div className="relative overflow-hidden rounded-3xl p-8">
              {/* Liquid Background */}
              <div className="absolute inset-0">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `
                      radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 40% 20%, rgba(255, 193, 7, 0.2) 0%, transparent 50%)
                    `,
                    filter: "blur(40px)",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(100px) saturate(150%)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                />
              </div>

              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-6">
                  {/* Avatar with glow */}
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-full animate-pulse"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(168, 85, 247, 0.4), transparent)",
                        filter: "blur(20px)",
                      }}
                    />
                    <div
                      className="relative w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-2xl"
                      style={{
                        background: "linear-gradient(135deg, #a855f7, #22c55e)",
                        boxShadow: "0 0 40px rgba(168, 85, 247, 0.5)",
                      }}
                    >
                      {agent?.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h2 className="text-3xl font-heading font-bold text-white mb-2 drop-shadow-lg">
                      {agent?.name ?? "Unknown Agent"}
                    </h2>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-body font-medium backdrop-blur-md ${
                          agent?.isActive
                            ? "bg-green-500/30 text-green-300 border border-green-400/30"
                            : "bg-gray-500/30 text-gray-300 border border-gray-400/30"
                        }`}
                      >
                        {agent?.isActive ? "● Active" : "○ Inactive"}
                      </span>
                      <span className="text-white/50 text-sm font-body">
                        Created{" "}
                        {agent?.createdAt
                          ? new Date(agent.createdAt).toLocaleDateString()
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions with glass effect */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="group px-5 py-2.5 rounded-2xl font-body text-red-300 transition-all duration-300 hover:scale-105 disabled:opacity-50 backdrop-blur-md"
                    style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)",
                    }}
                  >
                    <span className="group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                      {isDeleting ? "Deleting..." : "Delete"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Persona & Goal with Textarea */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Persona Card */}
              <div className="relative group">
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(168, 85, 247, 0.15), transparent)",
                    filter: "blur(40px)",
                  }}
                />
                <GlassPanel
                  className="relative rounded-2xl p-4 transition-all duration-300"
                  variant="heavy"
                >
                  <h3 className="text-white font-heading font-semibold text-lg mb-2">
                    Persona
                  </h3>
                  <textarea
                    value={localPersona || agent?.persona || ""}
                    onChange={(e) => setLocalPersona(e.target.value)}
                    onFocus={() => {
                      if (!localPersona) {
                        setLocalPersona(agent?.persona || "");
                      }
                    }}
                    onBlur={() => {
                      if (localPersona !== agent?.persona && agent?.id) {
                        updateAgent.mutate({
                          id: agent.id,
                          persona: localPersona,
                        });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl text-white placeholder-white/40 font-body resize-none transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    rows={16}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                      boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.2)",
                    }}
                    placeholder="Describe how this agent should behave..."
                  />
                  <p className="text-white/40 text-xs mt-2 font-body">
                    {(localPersona || agent?.persona || "").length} characters
                  </p>
                </GlassPanel>
              </div>

              {/* Goal Card */}
              <div className="relative group">
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(34, 197, 94, 0.15), transparent)",
                    filter: "blur(40px)",
                  }}
                />
                <GlassPanel
                  className="relative rounded-2xl p-4 transition-all duration-300"
                  variant="medium"
                >
                  <h3 className="text-white font-heading font-semibold text-lg mb-2">
                    Goal
                  </h3>
                  <textarea
                    value={localGoal || agent?.goal || ""}
                    onChange={(e) => setLocalGoal(e.target.value)}
                    onFocus={() => {
                      if (!localGoal) {
                        setLocalGoal(agent?.goal || "");
                      }
                    }}
                    onBlur={() => {
                      if (localGoal !== agent?.goal && agent?.id) {
                        updateAgent.mutate({
                          id: agent.id,
                          goal: localGoal,
                        });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl text-white placeholder-white/40 font-body resize-none transition-all focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    rows={16}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                      boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.2)",
                    }}
                    placeholder="What should this agent achieve?"
                  />
                  <p className="text-white/40 text-xs mt-2 font-body">
                    {(localGoal || agent?.goal || "").length} characters
                  </p>
                </GlassPanel>
              </div>
            </div>

            {/* Testing Section - Moved to bottom */}
            <AgentTester selectedAgentId={selectedAgentId} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
