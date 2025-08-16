"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAgent, useDeleteAgent } from "@/hooks/api/useAgentQueries";
import { useBrandQuery } from "@/hooks/api/useBrandQuery";
import { Problems } from "@/types/brand";
import DashboardSidebar from "@/components/dashboard2/DashboardSidebar";
import AgentModal from "@/components/team/AgentModal";
import RedditAgentThread from "@/components/team/RedditAgentThread";
// import { Conversation } from "@/types/agent"; // Unused import

type FilterType = "all" | "engaged" | "monitoring" | "archived";
type SortType = "newest" | "oldest" | "relevance" | "upvotes";

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const { data, isLoading, error } = useAgent(agentId);
  const { data: brandResponse } = useBrandQuery();
  const deleteAgent = useDeleteAgent();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("newest");
  const [selectedUseCase, setSelectedUseCase] = useState<Problems | null>(null);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [expandedConversations, setExpandedConversations] = useState<
    Set<string>
  >(new Set());
  // Note: expandedConversations is used by RedditAgentThread component handlers

  const agent = data;
  const brandData = brandResponse?.brand || null;
  const conversations = agent?.redditAgentConvos || [];
  const metrics = agent?.metrics;

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this agent? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAgent.mutateAsync(agentId);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to delete agent:", error);
      alert("Failed to delete agent. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConversationExpand = (conversationId: string) => {
    setExpandedConversations((prev) => new Set(prev).add(conversationId));
  };

  const handleConversationCollapse = (conversationId: string) => {
    setExpandedConversations((prev) => {
      const newSet = new Set(prev);
      newSet.delete(conversationId);
      return newSet;
    });
  };

  // Filter conversations based on selected filter
  const filteredConversations = conversations.filter(() => {
    // For now, we'll show all conversations since we don't have status in RedditConvo
    // In a real implementation, you'd filter based on conversation status
    return true;
  });

  // Sort conversations
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.parentPost.createdAt).getTime() -
          new Date(a.parentPost.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.parentPost.createdAt).getTime() -
          new Date(b.parentPost.createdAt).getTime()
        );
      case "upvotes":
        return (b.parentReply.upvotes || 0) - (a.parentReply.upvotes || 0);
      case "relevance":
        // Sort by reply count for now
        return (
          (b.parentReply.replyCount || 0) - (a.parentReply.replyCount || 0)
        );
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-white text-xl font-body">
          Loading agent...
        </div>
      </div>
    );
  }

  if (error || !agent) {
    console.log("error", error);
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl font-body mb-4">
            {error ? "Failed to load agent" : "Agent not found"}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 rounded-xl font-body text-white transition-all hover:scale-105"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Fixed Sidebar */}
      {brandData && (
        <div className="w-64 shrink-0">
          <DashboardSidebar
            brandName={brandData.name}
            problems={brandData.target_problems}
            selectedUseCase={selectedUseCase}
            onUseCaseSelect={setSelectedUseCase}
            onlyUnread={onlyUnread}
            setOnlyUnread={setOnlyUnread}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
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
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(34, 197, 94, 0.8))",
                  }}
                >
                  {agent?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>

                {/* Info */}
                <div>
                  <h1 className="text-2xl font-heading font-bold text-white mb-1">
                    {agent?.name ?? "Unknown Agent"}
                  </h1>
                  <p className="text-white/60 text-sm font-body mb-3">
                    Created{" "}
                    {agent?.createdAt
                      ? new Date(agent.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-body font-medium ${
                        agent?.isActive
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {agent?.isActive ? "Active" : "Inactive"}
                    </span>
                    {agent?.templateId && (
                      <span className="text-white/50 text-xs font-body">
                        Template: {agent.templateId.replace("-", " ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/dashboard/engage")}
                  className="px-4 py-2 rounded-xl font-body text-white/80 hover:text-white transition-all hover:scale-105"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  ← Back to Dashboard
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl font-body text-white transition-all hover:scale-105"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl font-body text-red-400 transition-all hover:scale-105 disabled:opacity-50"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                  }}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>

          {/* Metrics Dashboard */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div
                className="rounded-xl p-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)",
                  backdropFilter: "blur(15px)",
                  border: "1px solid rgba(168, 85, 247, 0.2)",
                }}
              >
                <p className="text-white/60 text-xs font-body mb-1">
                  Total Conversations
                </p>
                <p className="text-2xl font-heading font-bold text-white">
                  {metrics?.totalConversations ?? 0}
                </p>
              </div>

              <div
                className="rounded-xl p-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)",
                  backdropFilter: "blur(15px)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                }}
              >
                <p className="text-white/60 text-xs font-body mb-1">
                  Response Rate
                </p>
                <p className="text-2xl font-heading font-bold text-white">
                  {Math.round((metrics?.responseRate ?? 0) * 100)}%
                </p>
              </div>

              <div
                className="rounded-xl p-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                  backdropFilter: "blur(15px)",
                  border: "1px solid rgba(255, 193, 7, 0.2)",
                }}
              >
                <p className="text-white/60 text-xs font-body mb-1">
                  Engagement Rate
                </p>
                <p className="text-2xl font-heading font-bold text-white">
                  {Math.round((metrics?.engagementRate ?? 0) * 100)}%
                </p>
              </div>

              <div
                className="rounded-xl p-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 79, 0, 0.1) 0%, rgba(255, 79, 0, 0.05) 100%)",
                  backdropFilter: "blur(15px)",
                  border: "1px solid rgba(255, 79, 0, 0.2)",
                }}
              >
                <p className="text-white/60 text-xs font-body mb-1">
                  Reddit Karma
                </p>
                <p className="text-2xl font-heading font-bold text-white">
                  {metrics?.redditMetrics?.totalKarma ?? 0}
                </p>
              </div>
            </div>
          )}

          {/* Persona & Goal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="rounded-xl p-5"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <h3 className="text-white font-heading font-semibold mb-3">
                Persona
              </h3>
              <p className="text-white/70 text-sm font-body leading-relaxed">
                {agent?.persona ?? "No persona defined"}
              </p>
            </div>

            <div
              className="rounded-xl p-5"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <h3 className="text-white font-heading font-semibold mb-3">
                Goal
              </h3>
              <p className="text-white/70 text-sm font-body leading-relaxed">
                {agent?.goal ?? "No goal defined"}
              </p>
            </div>
          </div>

          {/* Conversations Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-bold text-white">
                Conversations ({sortedConversations?.length ?? 0})
              </h2>

              {/* Filters and Sort */}
              <div className="flex items-center gap-3">
                {/* Filter Tabs */}
                <div
                  className="flex items-center gap-1 p-1 rounded-lg"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  {(
                    ["all", "engaged", "monitoring", "archived"] as FilterType[]
                  ).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-3 py-1 rounded-md text-xs font-body capitalize transition-all ${
                        selectedFilter === filter
                          ? "text-white bg-white/10"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className="px-3 py-1.5 rounded-lg text-sm font-body text-white appearance-none cursor-pointer"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="upvotes">Most Upvotes</option>
                  <option value="relevance">Most Relevant</option>
                </select>
              </div>
            </div>

            {/* Conversations List */}
            <div className="space-y-4">
              {(sortedConversations?.length ?? 0) === 0 ? (
                <div
                  className="rounded-2xl p-8 text-center"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <p className="text-white/60 font-body">
                    No conversations found for this agent yet.
                  </p>
                </div>
              ) : (
                sortedConversations?.map((convo, idx) => (
                  <RedditAgentThread
                    key={idx}
                    redditConvo={convo}
                    onExpand={handleConversationExpand}
                    onCollapse={handleConversationCollapse}
                    agentName={agent.name}
                    agentAvatarUrl={agent.avatarUrl}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AgentModal
        isOpen={isEditing}
        agent={{
          id: agent.id,
          name: agent.name,
          persona: agent.persona,
          goal: agent.goal,
          avatar: agent.avatarUrl,
          createdAt: new Date(agent.createdAt),
          updatedAt: new Date(agent.updatedAt),
          isActive: agent.isActive ?? true,
          templateId: agent.templateId,
        }}
        onClose={() => setIsEditing(false)}
      />
    </div>
  );
}
