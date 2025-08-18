"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Agent } from "@/types/agent";
import type { SubredditPost } from "@/types/brand";
import { ensureRedditConnectedOrRedirect } from "@/lib/verify-reddit";

type SimplifiedAgentReplyProps = {
  agents: Agent[];
  isLoadingAgents: boolean;
  isGenerating: boolean;
  onGenerateWithAgent: (agentId?: string) => Promise<void>;
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

export default function SimplifiedAgentReply({
  agents,
  isLoadingAgents,
  isGenerating,
  onGenerateWithAgent,
  customReply,
  setCustomReply,
  submitPostAction,
  replySent,
  isSubmittingAction,
  post,
}: SimplifiedAgentReplyProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isCheckingReddit, setIsCheckingReddit] = useState(false);

  // Storage key for draft state
  const draftKey = `reddit-reply-draft-${post.id}`;

  // Get the first available agent for display
  const primaryAgent = agents.length > 0 ? agents[0] : null;

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
          timestamp: Date.now(),
        })
      );

      // Add post ID to URL hash so we can scroll back to it after redirect
      window.location.hash = `post-${post.id}`;

      // Check Reddit connection - will redirect if not connected
      const isConnected = await ensureRedditConnectedOrRedirect();

      if (isConnected) {
        // Reddit is connected, proceed with submission
        await submitPostAction("reply", customReply);
      }
    } catch (error) {
      console.error("Error during reply submission:", error);
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
        const { reply, timestamp } = JSON.parse(draftData);
        // Only restore if draft is less than 10 minutes old
        if (Date.now() - timestamp < 10 * 60 * 1000) {
          setCustomReply(reply);
        }
        // Clear the draft after restoring
        sessionStorage.removeItem(draftKey);
      } catch (error) {
        console.error("Error restoring draft:", error);
        sessionStorage.removeItem(draftKey);
      }
    }
  }, [draftKey, setCustomReply]);

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

  const handleSuggestReply = async () => {
    if (!primaryAgent || isGenerating) return;
    await onGenerateWithAgent(primaryAgent.id);
  };

  if (isLoadingAgents) {
    return (
      <motion.div
        className="mt-4 p-4 rounded-xl"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="flex items-center justify-center py-4">
          <div className="text-white/50 text-sm">Loading agent...</div>
        </div>
      </motion.div>
    );
  }

  if (!primaryAgent) {
    return (
      <motion.div
        className="mt-4 p-4 rounded-xl"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="text-center py-4">
          <div className="text-white/60 text-sm mb-2">No agents available</div>
          <div className="text-white/40 text-xs">
            Create an agent to generate replies
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mt-4 p-4 rounded-xl"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
      layout
    >
      {/* Agent Display and Suggest Reply Button */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href={`/dashboard/team/${primaryAgent.id}`}
          aria-label={`View ${primaryAgent.name}`}
          className="relative cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-green-400 flex items-center justify-center text-lg font-bold text-white shadow-lg">
            {primaryAgent.avatar && primaryAgent.avatar.startsWith("http") ? (
              <Image
                src={primaryAgent.avatar}
                alt={primaryAgent.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : primaryAgent.avatar &&
              !primaryAgent.avatar.startsWith("http") ? (
              <span>{primaryAgent.avatar}</span>
            ) : (
              <span>{primaryAgent.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </Link>
        <div className="flex-1 flex flex-col">
          <Link
            href={`/dashboard/team/${primaryAgent.id}`}
            className="text-white font-medium text-sm cursor-pointer hover:underline"
            aria-label={`View ${primaryAgent.name}`}
          >
            {primaryAgent.name}
          </Link>
          <button
            onClick={handleSuggestReply}
            disabled={isGenerating}
            className="mt-1 text-purple-400 hover:text-purple-300 text-xs font-medium transition-colors underline decoration-dotted disabled:opacity-50 text-left"
          >
            {isGenerating ? "Generating..." : "Suggest Reply"}
          </button>
        </div>
        {isGenerating && (
          <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></div>
        )}
      </div>

      {/* Reply Textarea */}
      <div className="mb-3">
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
            minHeight: "80px",
            maxHeight: "200px",
            overflowY: customReply.length > 500 ? "auto" : "hidden",
          }}
          rows={3}
        />
      </div>

      {/* Send Button */}
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
