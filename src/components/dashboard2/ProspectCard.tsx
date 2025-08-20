"use client";

import { RedditPost } from "@/types/brand";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import Link from "next/link";
import Image from "next/image";
import { useGenerateReply } from "@/hooks/useGenerateReply";
import { useProspectReplyAction } from "@/hooks/api/useProspectReplyAction";
import { ensureRedditConnectedOrRedirect } from "@/lib/verify-reddit";
import { motion } from "framer-motion";
import type { Agent } from "@/types/agent";
import { GlassCard } from "@/components/ui/GlassCard";
import { LiquidBadge } from "@/components/ui/LiquidBadge";
import { AttractiveText } from "@/components/ui/AttractiveText";
import { FloatingOrbGroup } from "@/components/ui/FloatingOrb";
import { glassStyles } from "@/lib/styles/glassMorphism";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { liquidGradients } from "@/lib/styles/gradients";

type SimplifiedAgentReplyProps = {
  agents: Agent[];
  isLoadingAgents: boolean;
  isGenerating: boolean;
  onGenerateWithAgent: (agentId?: string) => Promise<void>;
  customReply: string;
  setCustomReply: (value: string) => void;
  onReplySubmit: (content: string) => Promise<void>;
  replySent: boolean;
  isSubmittingAction: boolean;
  post: RedditPost;
};

function SimplifiedAgentReply({
  agents,
  isLoadingAgents,
  isGenerating,
  onGenerateWithAgent,
  customReply,
  setCustomReply,
  onReplySubmit,
  replySent,
  isSubmittingAction,
  post,
}: SimplifiedAgentReplyProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isCheckingReddit, setIsCheckingReddit] = useState(false);

  // Storage key for draft state
  const draftKey = `reddit-reply-draft-${post.thing_id}`;

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
      window.location.hash = `post-${post.thing_id}`;

      // Check Reddit connection - will redirect if not connected
      const isConnected = await ensureRedditConnectedOrRedirect();

      if (isConnected) {
        // Reddit is connected, proceed with submission
        await onReplySubmit(customReply);
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
    <div 
      className="mt-4 p-3 rounded-2xl"
      style={{
        background:
          "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow:
          "0 8px 32px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
      }}
    >
      {/* AI Agent Helper Section - Entire section clickable */}
      <div className="mb-3">
        <motion.button
          onClick={handleSuggestReply}
          disabled={isGenerating}
          className="w-full flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
          whileHover={{
            scale: isGenerating ? 1 : 1.02,
          }}
          whileTap={{
            scale: isGenerating ? 1 : 0.98,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative pointer-events-none"
            >
              <motion.div
                className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white shadow-lg relative"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(34, 197, 94, 0.9))",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
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
            </div>

            <span className="text-white font-semibold text-xs">
              {primaryAgent.name}
            </span>
          </div>

          <div className="flex-1 text-left">
            <p className="text-white/70 text-xs mb-1.5">
              brainstorm the perfect reply for this conversation
            </p>

            <div className="inline-flex items-center gap-1.5 text-white/50 text-xs">
              {isGenerating ? (
                <>
                  <motion.div
                    className="w-3 h-3 border-2 border-white/30 border-t-white/50 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span>Generating...</span>
                </>
              ) : (
                <>
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
                  <span>Draft Reply</span>
                </>
              )}
            </div>
          </div>
        </motion.button>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <GlassInput
            ref={textareaRef as any}
            type="textarea"
            value={customReply}
            onChange={(e) => setCustomReply(e.target.value)}
            placeholder="Type your reply here..."
            variant="ultra"
            autoResize
            className="pt-3 pb-4"
            rows={2}
            style={{
              maxHeight: "120px",
              overflowY: "auto",
            }}
          />
          {customReply && (
            <div className="absolute bottom-2 right-2 text-xs text-white/40">
              {customReply.length}/500
            </div>
          )}
        </div>

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
            shimmer={!!customReply.trim()}
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
    </div>
  );
}

interface ProspectCardProps {
  post: RedditPost;
  brandId: string;
  className?: string;
  onReply?: () => void;
}

export default function ProspectCard({
  post,
  brandId,
  className = "",
  onReply,
}: ProspectCardProps) {
  // const [showReplyBox, setShowReplyBox] = useState(false);

  const [customReply, setCustomReply] = useState<string>("");
  const [replySent, setReplySent] = useState(false);
  const [showScrollFade, setShowScrollFade] = useState(true);
  const [contentRef, setContentRef] = useState<HTMLDivElement | null>(null);

  const { agents, isLoadingAgents, isGenerating, generateWithAgent } =
    useGenerateReply(brandId);
  
  const replyMutation = useProspectReplyAction();

  // Format timestamp
  const timeAgo = formatDistanceToNow(new Date(post.created_utc * 1000), {
    addSuffix: true,
  });

  // Handle scroll detection for fade indicator
  useEffect(() => {
    if (!contentRef) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = contentRef;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5; // 5px threshold
      setShowScrollFade(!isAtBottom);
    };

    // Check initial state
    handleScroll();

    contentRef.addEventListener("scroll", handleScroll);
    return () => contentRef.removeEventListener("scroll", handleScroll);
  }, [contentRef]);

  // Markdown renderers for Reddit-like dark theme
  const markdownComponents: Components = {
    a: (props) => <a {...props} className="text-blue-400 hover:underline" />,
    p: (props) => <p {...props} className="mb-2" />,
    ul: (props) => <ul {...props} className="list-disc pl-6 mb-2" />,
    ol: (props) => <ol {...props} className="list-decimal pl-6 mb-2" />,
    li: (props) => <li {...props} className="mb-1" />,
    blockquote: (props) => (
      <blockquote
        {...props}
        className="border-l-4 border-white/20 pl-3 text-white/70 italic"
      />
    ),
    code: (props: any) => {
      const { inline, children, ...rest } = props;
      if (inline) {
        return (
          <code
            {...rest}
            className="bg-[#272729] text-white/90 px-1.5 py-0.5 rounded"
          >
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-[#272729] text-white/90 p-3 rounded-md overflow-auto mb-3">
          <code {...rest}>{children}</code>
        </pre>
      );
    },
    h1: (props) => <h1 {...props} className="text-xl font-semibold mb-2" />,
    h2: (props) => <h2 {...props} className="text-lg font-semibold mb-2" />,
    h3: (props) => <h3 {...props} className="text-base font-semibold mb-2" />,
  };

  // Debug mount/unmount and identity
  useEffect(() => {
    console.log("[ProspectCard] mount", { postId: post.thing_id });
    return () => {
      console.log("[ProspectCard] unmount", { postId: post.thing_id });
    };
  }, [post.thing_id]);

  const handleGenerateWithAgent = async (agentId?: string) => {
    if (!agentId) return;
    try {
      const result = await generateWithAgent(agentId, post, {
        autoReply: true,
      });
      if (result.content) {
        setCustomReply(result.content);
      }
    } catch (error) {
      console.error("Error generating reply with agent:", error);
      alert("Failed to generate reply. Please try again.");
    }
  };

  const handleReplySubmit = async (content: string) => {
    // Call the onReply callback immediately to trigger swipe
    if (onReply) {
      onReply();
    }
    
    try {
      await replyMutation.mutateAsync({
        brandId,
        prospectId: post.thing_id,
        postId: post.thing_id,
        content,
        agentId: agents.length > 0 ? agents[0].id : undefined,
        post: post,
      });
      
      setReplySent(true);
      setTimeout(() => {
        setReplySent(false);
      }, 2500);
    } catch (error) {
      console.error("Error submitting reply:", error);
      // Don't show alert since we already swiped
    }
  };

  return (
    <div
      className={`relative w-full max-w-4xl ${className}`}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Simplified Liquid Glass Frame */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          ...glassStyles.medium,
          padding: "2px",
          borderRadius: "24px",
        }}
      >
        {/* Simplified Floating Orbs */}
        <FloatingOrbGroup />
        {/* Inner Glass Container */}
        <div className="w-full h-full rounded-3xl relative overflow-hidden">
            <div
              className="w-full h-full px-6 py-4 flex flex-col rounded-2xl relative overflow-visible"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                ...glassStyles.dark,
                background: `
                  linear-gradient(135deg,
                    rgba(8, 8, 15, 0.98) 0%,
                    rgba(15, 12, 25, 0.96) 25%,
                    rgba(12, 8, 20, 0.98) 50%,
                    rgba(18, 15, 30, 0.96) 75%,
                    rgba(10, 8, 18, 0.98) 100%
                  )
                `,
              }}
            >
              {/* Header - Fixed */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Link
                    href={`https://reddit.com${post.permalink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <h3 className="text-white font-heading text-lg font-bold mb-2 line-clamp-2 transition-colors duration-200 group-hover:text-blue-400 cursor-pointer">
                      {post.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3 text-sm">
                    {/* Subreddit Badge */}
                    <LiquidBadge variant="orange" size="md">
                      r/{post.subreddit}
                    </LiquidBadge>

                    {/* Author */}
                    <Link
                      href={`https://reddit.com/user/${post.author}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white/80 transition-colors duration-200"
                    >
                      by u/{post.author}
                    </Link>

                    {/* Time */}
                    <span className="text-white/40">{timeAgo}</span>
                  </div>
                </div>
              </div>

              {/* Content - Scrollable with fixed height */}
              {post.content && (
                <div className="mb-4 relative">
                  <div
                    ref={setContentRef}
                    className="overflow-y-auto text-white/80 font-body text-sm leading-relaxed rounded-lg"
                    style={{
                      maxHeight: "240px", // Fixed height for content area
                      minHeight: "100px",
                      paddingRight: "8px", // Space for scrollbar
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize]}
                      components={markdownComponents}
                    >
                      {post.content}
                    </ReactMarkdown>
                  </div>
                  {/* Fade gradient indicator at bottom when content is scrollable */}
                  <div
                    className="rounded-lg absolute bottom-0 left-0 right-0 h-16 pointer-events-none transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.1) 20%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.5) 80%, rgba(0, 0, 0, 0.6) 100%)",
                      opacity: showScrollFade ? 1 : 0,
                    }}
                  >
                    {/* Small scroll hint at the bottom */}
                    {showScrollFade && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="text-white/30 text-xs animate-pulse">
                          ↓ scroll
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metrics - Fixed */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-emerald-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="text-white/70 text-sm">{post.score}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span className="text-white/70 text-sm">
                      {post.reply_count}
                    </span>
                  </div>

                  {/* Link Flair */}
                  {post.link_flair && (
                    <LiquidBadge variant="purple" size="sm">
                      {post.link_flair}
                    </LiquidBadge>
                  )}
                </div>
              </div>

              {/* Reply box - Fixed at bottom */}
              <SimplifiedAgentReply
                agents={agents}
                isLoadingAgents={isLoadingAgents}
                isGenerating={isGenerating}
                onGenerateWithAgent={handleGenerateWithAgent}
                customReply={customReply}
                setCustomReply={setCustomReply}
                onReplySubmit={handleReplySubmit}
                replySent={replySent}
                isSubmittingAction={replyMutation.isPending}
                post={
                  {
                    id: post.thing_id,
                    post_id: post.thing_id.replace("t3_", ""),
                    subreddit: post.subreddit,
                    title: post.title,
                    author: post.author,
                    content: post.content,
                    created_at: new Date(post.created_utc * 1000).toISOString(),
                    updated_at: null,
                    link: post.permalink,
                    image: post.thumbnail || null,
                    up_votes: post.upvotes,
                    down_votes: post.downvotes,
                    num_comments: post.reply_count,
                    llm_explanation: "",
                    llm_response: { index: 0, model: "" },
                    status: post.status,
                    tags: {
                      potential_customer: false,
                      competitor_mention: false,
                      own_mention: false,
                      positive_sentiment: false,
                      negative_sentiment: false,
                      neutral_sentiment: false,
                    },
                    problem_id: "",
                    brand_id: brandId,
                  } as any
                }
              />

              {/* Suggested Reply (if exists) */}
              {post.suggested_agent_reply && (
                <GlassCard
                  blur="medium"
                  border="gradient"
                  className="mt-4 p-3 max-h-[120px] overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-4 h-4 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <AttractiveText variant="gradient" size="xs">
                      Suggested Reply
                    </AttractiveText>
                  </div>
                  <p className="text-white/70 text-xs font-body leading-relaxed">
                    {post.suggested_agent_reply}
                  </p>
                </GlassCard>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
