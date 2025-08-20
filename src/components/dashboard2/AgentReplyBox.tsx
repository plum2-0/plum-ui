"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Agent } from "@/types/agent";
import type { RedditPost } from "@/types/brand";
import { useGenerateAgent } from "@/hooks/api/useAgentQueries";
import { useBrandQuery } from "@/hooks/api/useBrandQuery";
import { ensureRedditConnectedOrRedirect } from "@/lib/verify-reddit";
import GenerateFirstAgent from "@/components/dashboard2/GenerateFirstAgent";

type AgentReplyBoxProps = {
  agents: Agent[];
  isLoadingAgents: boolean;
  isGenerating: boolean;
  selectedAgentId: string | null;
  setSelectedAgentId: (id: string | null) => void;
  lastUsedAgentId: string | null;
  onGenerateWithAgent: (agentId?: string) => Promise<void>;
  onRegenerate: () => Promise<void>;
  customReply: string;
  setCustomReply: (value: string) => void;
  onReplySubmit: (content: string) => Promise<void>;
  replySent: boolean;
  isSubmittingAction: boolean;
  post: RedditPost;
};

export default function AgentReplyBox({
  agents,
  isLoadingAgents,
  isGenerating,
  selectedAgentId,
  setSelectedAgentId,
  lastUsedAgentId,
  onGenerateWithAgent,
  onRegenerate,
  customReply,
  setCustomReply,
  onReplySubmit,
  replySent,
  isSubmittingAction,
  post,
}: AgentReplyBoxProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: brandData } = useBrandQuery();
  const generateAgent = useGenerateAgent();
  const [isGeneratingAgent, setIsGeneratingAgent] = useState(false);
  const [isCheckingReddit, setIsCheckingReddit] = useState(false);

  // Storage key for draft state
  const draftKey = `reddit-reply-draft-${post.thing_id}`;

  const handleGenerateAgent = async () => {
    if (!brandData?.brand?.id) {
      alert("Brand ID not found. Please refresh and try again.");
      return;
    }

    setIsGeneratingAgent(true);
    try {
      await generateAgent.mutateAsync(brandData.brand.id);
    } catch (error) {
      console.error("Failed to generate agent:", error);
      alert("Failed to generate agent. Please try again.");
    } finally {
      setIsGeneratingAgent(false);
    }
  };

  // Handle reply submission with Reddit auth check
  const handleSendReply = async () => {
    if (!customReply.trim() || isSubmittingAction || replySent) return;

    setIsCheckingReddit(true);
    try {
      // Save draft state before potential redirect
      sessionStorage.setItem(
        draftKey,
        JSON.stringify({
          reply: customReply,
          agentId: selectedAgentId,
          timestamp: Date.now(),
        })
      );

      // Add post ID to URL hash so we can scroll back to it after redirect
      window.location.hash = `post-${post.thing_id}`;

      // Check Reddit connection - will redirect if not connected
      const isConnected = await ensureRedditConnectedOrRedirect();

      if (isConnected) {
        // Reddit is connected, proceed with submission
        await onReplySubmit(customReply);
      }
    } catch (error) {
      console.error("Error during reply submission:", error);
      // If ensureRedditConnectedOrRedirect throws due to redirect, this won't execute
      // Otherwise, show error
      alert("Failed to submit reply. Please try again.");
    } finally {
      setIsCheckingReddit(false);
    }
  };

  // Restore draft on mount if returning from redirect
  useEffect(() => {
    const draftData = sessionStorage.getItem(draftKey);
    if (draftData) {
      try {
        const { reply, agentId, timestamp } = JSON.parse(draftData);
        // Only restore if draft is less than 10 minutes old
        if (Date.now() - timestamp < 10 * 60 * 1000) {
          setCustomReply(reply);
          if (agentId) {
            setSelectedAgentId(agentId);
          }
        }
        // Clear the draft after restoring
        sessionStorage.removeItem(draftKey);
      } catch (error) {
        console.error("Error restoring draft:", error);
        sessionStorage.removeItem(draftKey);
      }
    }
  }, [draftKey, setCustomReply, setSelectedAgentId]);

  // Clear reply and draft when successfully sent
  useEffect(() => {
    if (replySent) {
      setCustomReply("");
      sessionStorage.removeItem(draftKey);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [replySent, draftKey, setCustomReply]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [customReply]);

  const selected = selectedAgentId
    ? agents.find((a) => a.id === selectedAgentId) || null
    : null;
  const bench = selectedAgentId
    ? agents.filter((a) => a.id !== selectedAgentId)
    : [];

  return (
    <motion.div
      className="mt-4 p-4 rounded-xl relative"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
      layout
    >
      <div className="mb-4">
        {isLoadingAgents ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-white/50 text-sm">Loading agents...</div>
          </div>
        ) : agents.length === 0 ? (
          <GenerateFirstAgent />
        ) : (
          <LayoutGroup id="agent-chooser">
            <AnimatePresence initial={false} mode="wait">
              {selected ? (
                <motion.div
                  key="selected-panel"
                  className="relative"
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  layout
                >
                  <motion.div
                    className="relative flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10"
                    layout
                  >
                    <motion.div
                      className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-green-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                      layoutId={`agent-avatar-${selected.id}`}
                    >
                      {selected.avatar && selected.avatar.startsWith("http") ? (
                        <Image
                          src={selected.avatar}
                          alt={selected.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : selected.avatar &&
                        !selected.avatar.startsWith("http") ? (
                        <span>{selected.avatar}</span>
                      ) : (
                        <span>{selected.name.charAt(0).toUpperCase()}</span>
                      )}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {selected.name}
                      </div>
                      <div className="text-white/60 text-xs mt-0.5">
                        This reply will be assigned to {selected.name}'s queue
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedAgentId(null)}
                        className="text-white/60 hover:text-white text-xs underline decoration-dotted"
                        disabled={isGenerating}
                        aria-label="Change agent"
                      >
                        Change
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `http://localhost:3001/dashboard/team/${brandData?.brand?.id}`
                          )
                        }
                        className="text-white/60 hover:text-white p-1 rounded transition-colors"
                        disabled={isGenerating}
                        aria-label="Edit agent"
                        title="Edit agent"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    </div>
                    {isGenerating && (
                      <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </motion.div>

                  {bench.length > 0 && (
                    <motion.div
                      className="absolute -top-1 right-0 flex -space-x-2"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {bench.slice(0, 5).map((a) => (
                        <motion.button
                          key={a.id}
                          type="button"
                          onClick={() => {
                            setSelectedAgentId(a.id);
                            onGenerateWithAgent(a.id);
                          }}
                          className="w-6 h-6 rounded-full overflow-hidden border border-white/20 bg-white/10 flex items-center justify-center text-[10px] text-white/80 hover:scale-105 transition"
                          title={a.name}
                          whileTap={{ scale: 0.95 }}
                        >
                          {a.avatar && a.avatar.startsWith("http") ? (
                            <Image
                              src={a.avatar}
                              alt={a.name}
                              width={24}
                              height={24}
                              className="w-full h-full object-cover"
                            />
                          ) : a.avatar && !a.avatar.startsWith("http") ? (
                            <span>{a.avatar}</span>
                          ) : (
                            <span>{a.name.charAt(0).toUpperCase()}</span>
                          )}
                        </motion.button>
                      ))}
                      {bench.length > 5 && (
                        <div className="w-6 h-6 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-[10px] text-white/70">
                          +{bench.length - 5}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  layout
                >
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {agents.map((agent) => (
                      <motion.button
                        key={agent.id}
                        type="button"
                        onClick={() => {
                          setSelectedAgentId(agent.id);
                          onGenerateWithAgent(agent.id);
                        }}
                        disabled={isGenerating}
                        className={`
                        relative group flex flex-col items-center p-3 rounded-xl
                        transition-all duration-200 hover:scale-105
                        ${
                          selectedAgentId === agent.id
                            ? "bg-gradient-to-br from-purple-500/20 to-green-500/20 border-2 border-purple-400/50"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }
                        ${
                          isGenerating
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }
                      `}
                        whileTap={{ scale: 0.98 }}
                        layoutId={`agent-card-${agent.id}`}
                      >
                        <motion.div
                          className="relative w-12 h-12 mb-2 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-green-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                          layoutId={`agent-avatar-${agent.id}`}
                        >
                          {agent.avatar && agent.avatar.startsWith("http") ? (
                            <Image
                              src={agent.avatar}
                              alt={agent.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : agent.avatar &&
                            !agent.avatar.startsWith("http") ? (
                            <span>{agent.avatar}</span>
                          ) : (
                            <span>{agent.name.charAt(0).toUpperCase()}</span>
                          )}
                          {selectedAgentId === agent.id && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                          )}
                        </motion.div>
                        <span className="text-white/80 text-xs font-medium text-center line-clamp-2">
                          {agent.name}
                        </span>
                        {isGenerating && selectedAgentId === agent.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                    {/* Generate AI Agent Button in Grid */}
                    <motion.button
                      type="button"
                      onClick={handleGenerateAgent}
                      disabled={isGeneratingAgent}
                      className="relative group flex flex-col items-center p-3 rounded-xl
                        bg-white/5 border-2 border-dashed border-purple-400/30 hover:border-purple-400/50
                        transition-all duration-200 hover:scale-105 hover:bg-white/10
                        cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-12 h-12 mb-2 rounded-full overflow-hidden bg-gradient-to-br from-purple-400/40 to-purple-600/40 flex items-center justify-center text-2xl font-bold text-white/80 shadow-lg">
                        {isGeneratingAgent ? (
                          <svg
                            className="w-6 h-6 animate-spin"
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
                            className="w-6 h-6"
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
                      </div>
                      <span className="text-white/60 text-xs font-medium text-center">
                        {isGeneratingAgent
                          ? "Generating..."
                          : "Create New Agent"}
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>
        )}
      </div>

      <div className="flex items-start justify-between mb-3">
        <textarea
          ref={textareaRef}
          value={customReply}
          onChange={(e) => {
            setCustomReply(e.target.value);
            e.currentTarget.style.height = "auto";
            e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
          }}
          placeholder="Write your reply or use AI generation above..."
          className="w-full p-3 rounded-xl font-body text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            minHeight: "100px",
            maxHeight: "400px",
            overflowY: customReply.length > 1000 ? "auto" : "hidden",
          }}
          rows={4}
        />
        {lastUsedAgentId && (
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="ml-3 text-white/70 hover:text-white hover:scale-110 transition-all duration-200 disabled:opacity-50"
            title="Regenerate with same agent"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      <div className="flex justify-end">
        <motion.button
          onClick={handleSendReply}
          disabled={
            !customReply.trim() ||
            isSubmittingAction ||
            replySent ||
            isCheckingReddit
          }
          className="px-4 py-2 rounded-xl font-body font-semibold text-sm transition-all duration-300 hover:scale-105"
          style={{
            background: customReply.trim()
              ? "linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.8))"
              : "rgba(255, 255, 255, 0.05)",
            color: customReply.trim() ? "white" : "rgba(255, 255, 255, 0.5)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            boxShadow: customReply.trim()
              ? "0 4px 12px rgba(34, 197, 94, 0.3)"
              : "none",
            textShadow: customReply.trim()
              ? "0 1px 2px rgba(0, 0, 0, 0.3)"
              : "none",
          }}
          whileTap={{ scale: 0.98 }}
        >
          {isCheckingReddit
            ? "Checking Reddit..."
            : isSubmittingAction
            ? "Submitting..."
            : replySent
            ? "Sent!"
            : "Send Reply"}
        </motion.button>
      </div>
    </motion.div>
  );
}
