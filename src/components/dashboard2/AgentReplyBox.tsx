"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import type { Agent } from "@/types/agent";
import type { SubredditPost } from "@/types/brand";

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
  submitPostAction: (
    action: "reply" | "ignore",
    text?: string
  ) => Promise<void>;
  replySent: boolean;
  isSubmittingAction: boolean;
  post: SubredditPost;
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
  submitPostAction,
  replySent,
  isSubmittingAction,
}: AgentReplyBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        <h4 className="text-white font-heading text-sm font-semibold mb-3">
          Which of your Team mates should engage with this post?
        </h4>

        {isLoadingAgents ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-white/50 text-sm">Loading agents...</div>
          </div>
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
                    <button
                      onClick={() => setSelectedAgentId(null)}
                      className="text-white/60 hover:text-white text-xs underline decoration-dotted"
                      disabled={isGenerating}
                      aria-label="Change agent"
                    >
                      Change
                    </button>
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
                  className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  layout
                >
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
                        ) : agent.avatar && !agent.avatar.startsWith("http") ? (
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
          onClick={() => submitPostAction("reply", customReply)}
          disabled={!customReply.trim() || isSubmittingAction || replySent}
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
          {isSubmittingAction
            ? "Submitting..."
            : replySent
            ? "Sent!"
            : "Send Reply"}
        </motion.button>
      </div>
    </motion.div>
  );
}
