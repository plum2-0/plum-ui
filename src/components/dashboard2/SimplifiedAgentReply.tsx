"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Agent } from "@/types/agent";
import type { SubredditPost } from "@/types/brand";
import { ensureRedditConnectedOrRedirect } from "@/lib/verify-reddit";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { AttractiveText } from "@/components/ui/AttractiveText";

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
      <GlassCard blur="medium" border="animated" className="mt-4 p-4">
        <div className="flex items-center justify-center py-4">
          <AttractiveText variant="gradient" size="sm">
            Loading agent...
          </AttractiveText>
        </div>
      </GlassCard>
    );
  }

  if (!primaryAgent) {
    return (
      <GlassCard blur="medium" border="static" className="mt-4 p-4">
        <div className="text-center py-4">
          <div className="text-white/60 text-sm mb-2">No agents available</div>
          <div className="text-white/40 text-xs">
            Create an agent to generate replies
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard blur="medium" border="gradient" className="mt-4 p-3" reflection>
      {/* AI Agent Helper Section */}
      <div className="mb-3">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/20">
          <div className="flex flex-col items-center gap-2">
            <Link
              href={`/dashboard/team/${primaryAgent.id}`}
              aria-label={`View ${primaryAgent.name}`}
              className="relative cursor-pointer group"
            >
              <motion.div
                className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white shadow-lg relative"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(34, 197, 94, 0.9))",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {primaryAgent.avatar &&
                primaryAgent.avatar.startsWith("http") ? (
                  <Image
                    src={primaryAgent.avatar}
                    alt={primaryAgent.name}
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                  />
                ) : primaryAgent.avatar &&
                  !primaryAgent.avatar.startsWith("http") ? (
                  <span className="text-[10px]">{primaryAgent.avatar}</span>
                ) : (
                  <span>{primaryAgent.name.charAt(0).toUpperCase()}</span>
                )}
              </motion.div>
              {/* AI Agent badge positioned absolutely */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center border border-white/20">
                <svg
                  className="w-2 h-2 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L3 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.734.99A.996.996 0 0118 6v2a1 1 0 11-2 0v-.277l-1.254.145a1 1 0 11-.992-1.736L14.984 6l-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.723V12a1 1 0 11-2 0v-1.277l-1.246-.855a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.277l1.246.855a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.277V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.75 1a.996.996 0 01-.992 0l-1.75-1a1 1 0 01-.372-1.364z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </Link>

            <Link
              href={`/dashboard/team/${primaryAgent.id}`}
              className="text-white font-semibold text-xs cursor-pointer hover:underline"
              aria-label={`View ${primaryAgent.name}`}
            >
              {primaryAgent.name}
            </Link>
          </div>

          <div className="flex-1">
            <p className="text-white/70 text-xs mb-2">
              Let me help you craft the perfect reply for this conversation
            </p>

            <LiquidButton
              variant="primary"
              size="sm"
              onClick={handleSuggestReply}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-xs py-1 px-2"
              shimmer={!isGenerating}
            >
              <div className="flex items-center gap-1">
                {isGenerating ? (
                  <motion.div
                    className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ) : (
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                )}
                <span className="text-white font-medium">
                  {isGenerating ? "Generating..." : "Draft Reply"}
                </span>
              </div>
            </LiquidButton>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <motion.textarea
          ref={textareaRef}
          value={customReply}
          onChange={(e) => {
            setCustomReply(e.target.value);
            e.currentTarget.style.height = "auto";
            e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
          }}
          placeholder="Type your reply here..."
          className="w-full p-3 rounded-xl font-body text-sm resize-none focus:outline-none transition-all overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "white",
            minHeight: "80px",
            maxHeight: "150px",
            overflowY: customReply.length > 500 ? "auto" : "hidden",
            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
          whileFocus={{
            boxShadow:
              "inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(34, 197, 94, 0.3)",
            borderColor: "rgba(34, 197, 94, 0.5)",
          }}
          rows={2}
        />

        {/* Send Button */}
        <div className="flex justify-end">
          <LiquidButton
            variant={customReply.trim() ? "primary" : "secondary"}
            size="md"
            onClick={handleSendReply}
            disabled={
              !customReply.trim() ||
              isSubmittingAction ||
              replySent ||
              isCheckingReddit
            }
            shimmer={customReply.trim()}
            className={
              customReply.trim()
                ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                : ""
            }
          >
            <div className="flex items-center gap-2">
              {(isCheckingReddit || isSubmittingAction) && (
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
              <span>
                {isCheckingReddit
                  ? "Checking Reddit..."
                  : isSubmittingAction
                  ? "Submitting..."
                  : replySent
                  ? "Reply Sent!"
                  : "Send Reply"}
              </span>
            </div>
          </LiquidButton>
        </div>
      </div>
    </GlassCard>
  );
}
