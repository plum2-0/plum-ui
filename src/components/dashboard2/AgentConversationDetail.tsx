"use client";

import { useState } from "react";
import { AgentDetails, RedditConvo } from "@/types/agent";
import RedditAgentThread from "@/components/team/RedditAgentThread";
import Image from "next/image";

type FilterType = "all" | "engaged" | "monitoring" | "archived";
type SortType = "newest" | "oldest" | "relevance" | "upvotes";

interface AgentConversationDetailProps {
  agent: AgentDetails;
  onBack: () => void;
}

export default function AgentConversationDetail({
  agent,
  onBack,
}: AgentConversationDetailProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("newest");
  const [expandedConversations, setExpandedConversations] = useState<
    Set<string>
  >(new Set());

  const conversations = agent.redditAgentConvos || [];
  const metrics = agent.metrics;

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
  const sortedConversations = [...filteredConversations].sort(
    (a: RedditConvo, b: RedditConvo) => {
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
    }
  );

  return (
    <div className="space-y-6">
      {/* Header - Styled similar to Reddit Posts of Interest */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(34, 197, 94, 0.3))",
            }}
          >
            <svg
              className="w-5 h-5 text-purple-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z"
              />
            </svg>
          </div>
          <h2 className="text-white font-heading text-xl font-bold">
            Active Conversations
          </h2>
        </div>
      </div>

      {/* Agent Header */}
      <h2 className="text-xl font-heading font-bold text-white">
        Using Persona
      </h2>
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
            {agent.avatarUrl ? (
              <Image
                src={agent.avatarUrl}
                alt={agent.name}
                width={64}
                height={64}
                className="rounded-full shrink-0"
                style={{
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(34, 197, 94, 0.8))",
                }}
              >
                {agent.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Info */}
            <div>
              <h1 className="text-2xl font-heading font-bold text-white mb-1">
                {agent.name}
              </h1>
              <p className="text-white/60 text-sm font-body mb-3">
                Created {new Date(agent.createdAt).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-body font-medium ${
                    agent.isActive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {agent.isActive ? "Active" : "Inactive"}
                </span>
                {agent.templateId && (
                  <span className="text-white/50 text-xs font-body">
                    Template: {agent.templateId.replace("-", " ")}
                  </span>
                )}
              </div>
            </div>
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
              {metrics.totalConversations ?? 0}
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
              {Math.round((metrics.responseRate ?? 0) * 100)}%
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
              {Math.round((metrics.engagementRate ?? 0) * 100)}%
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
            <p className="text-white/60 text-xs font-body mb-1">Reddit Karma</p>
            <p className="text-2xl font-heading font-bold text-white">
              {metrics.redditMetrics?.totalKarma ?? 0}
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
            {agent.persona}
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
          <h3 className="text-white font-heading font-semibold mb-3">Goal</h3>
          <p className="text-white/70 text-sm font-body leading-relaxed">
            {agent.goal}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="p-6 border-t border-white/10" />

      {/* Conversations Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-bold text-white">
            Conversations ({sortedConversations.length})
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
          {sortedConversations.length === 0 ? (
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
            sortedConversations.map((convo: RedditConvo, idx: number) => (
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
  );
}
