"use client";

import { RedditPost } from "@/types/brand";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { useGenerateReply } from "@/hooks/useGenerateReply";
import SimplifiedAgentReply from "./SimplifiedAgentReply";
import { GlassCard } from "@/components/ui/GlassCard";
import { LiquidBadge } from "@/components/ui/LiquidBadge";
import { AttractiveText } from "@/components/ui/AttractiveText";

interface ProspectCardProps {
  post: RedditPost;
  brandId: string;
  className?: string;
}

export default function ProspectCard({
  post,
  brandId,
  className = "",
}: ProspectCardProps) {
  // const [showReplyBox, setShowReplyBox] = useState(false);

  const [customReply, setCustomReply] = useState<string>("");
  const [replySent, setReplySent] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [showScrollFade, setShowScrollFade] = useState(true);
  const [contentRef, setContentRef] = useState<HTMLDivElement | null>(null);

  const { agents, isLoadingAgents, isGenerating, generateWithAgent } =
    useGenerateReply(brandId);

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

  async function submitPostAction(action: "reply" | "ignore", text?: string) {
    setIsSubmittingAction(true);
    try {
      const response = await fetch(`/api/brand/post/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: brandId,
          prospect_id: post.thing_id,
          post_id: post.thing_id,
          user_content_action: action,
          content: action === "reply" ? text || "" : undefined,
          agent_id:
            action === "reply"
              ? agents.length > 0
                ? agents[0].id
                : undefined
              : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit action");
      }

      if (action === "reply") {
        setReplySent(true);
        setTimeout(() => {
          setReplySent(false);
        }, 2500);
      }
    } catch (error) {
      console.error("Error submitting action:", error);
      alert("Failed to submit action. Please try again.");
    } finally {
      setIsSubmittingAction(false);
    }
  }

  return (
    <div
      className={`relative w-full max-w-4xl ${className}`}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Outer Liquid Glass Frame - Multiple layers for depth */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background: `
            linear-gradient(45deg,
              rgba(255, 255, 255, 0.15) 0%,
              rgba(255, 255, 255, 0.05) 25%,
              transparent 50%,
              rgba(255, 255, 255, 0.05) 75%,
              rgba(255, 255, 255, 0.15) 100%
            ),
            linear-gradient(135deg,
              rgba(0, 200, 255, 0.1) 0%,
              rgba(128, 0, 255, 0.1) 50%,
              rgba(255, 0, 128, 0.1) 100%
            )
          `,
          padding: "3px",
          borderRadius: "24px",
        }}
      >
        {/* Floating Liquid Glass Orbs */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          {/* Orb 1 - Top Left */}
          <div
            className="absolute rounded-full opacity-20"
            style={{
              width: "60px",
              height: "60px",
              top: "15%",
              left: "12%",
              background: `
                radial-gradient(circle,
                  rgba(0, 255, 200, 0.6) 0%,
                  rgba(0, 255, 200, 0.3) 40%,
                  transparent 70%
                )
              `,
              filter: "blur(8px)",
              animation: "float-pulse-1 6s ease-in-out infinite",
            }}
          />

          {/* Orb 2 - Top Right */}
          <div
            className="absolute rounded-full opacity-15"
            style={{
              width: "80px",
              height: "80px",
              top: "8%",
              right: "18%",
              background: `
                radial-gradient(circle,
                  rgba(128, 0, 255, 0.5) 0%,
                  rgba(128, 0, 255, 0.2) 50%,
                  transparent 80%
                )
              `,
              filter: "blur(12px)",
              animation: "float-pulse-2 8s ease-in-out infinite",
            }}
          />

          {/* Orb 3 - Bottom Left */}
          <div
            className="absolute rounded-full opacity-18"
            style={{
              width: "45px",
              height: "45px",
              bottom: "20%",
              left: "8%",
              background: `
                radial-gradient(circle,
                  rgba(255, 0, 128, 0.7) 0%,
                  rgba(255, 0, 128, 0.3) 45%,
                  transparent 75%
                )
              `,
              filter: "blur(6px)",
              animation: "float-pulse-3 7s ease-in-out infinite",
            }}
          />

          {/* Orb 4 - Bottom Right */}
          <div
            className="absolute rounded-full opacity-12"
            style={{
              width: "70px",
              height: "70px",
              bottom: "12%",
              right: "10%",
              background: `
                radial-gradient(circle,
                  rgba(0, 200, 255, 0.4) 0%,
                  rgba(100, 150, 255, 0.2) 60%,
                  transparent 85%
                )
              `,
              filter: "blur(10px)",
              animation: "float-pulse-4 9s ease-in-out infinite",
            }}
          />

          {/* Orb 5 - Center Subtle */}
          <div
            className="absolute rounded-full opacity-8"
            style={{
              width: "120px",
              height: "120px",
              top: "40%",
              left: "50%",
              transform: "translateX(-50%)",
              background: `
                radial-gradient(circle,
                  rgba(255, 255, 255, 0.1) 0%,
                  rgba(255, 255, 255, 0.05) 30%,
                  transparent 60%
                )
              `,
              filter: "blur(20px)",
              animation: "float-pulse-5 12s ease-in-out infinite",
            }}
          />
        </div>

        <style jsx>{`
          @keyframes float-pulse-1 {
            0%,
            100% {
              transform: translateY(0px) scale(1);
              opacity: 0.2;
            }
            50% {
              transform: translateY(-8px) scale(1.1);
              opacity: 0.35;
            }
          }

          @keyframes float-pulse-2 {
            0%,
            100% {
              transform: translateY(0px) scale(1);
              opacity: 0.15;
            }
            50% {
              transform: translateY(-12px) scale(1.2);
              opacity: 0.25;
            }
          }

          @keyframes float-pulse-3 {
            0%,
            100% {
              transform: translateY(0px) scale(1);
              opacity: 0.18;
            }
            50% {
              transform: translateY(-6px) scale(1.15);
              opacity: 0.3;
            }
          }

          @keyframes float-pulse-4 {
            0%,
            100% {
              transform: translateY(0px) scale(1);
              opacity: 0.12;
            }
            50% {
              transform: translateY(-10px) scale(1.25);
              opacity: 0.2;
            }
          }

          @keyframes float-pulse-5 {
            0%,
            100% {
              transform: translateX(-50%) translateY(0px) scale(1);
              opacity: 0.08;
            }
            50% {
              transform: translateX(-50%) translateY(-5px) scale(1.05);
              opacity: 0.15;
            }
          }
        `}</style>
        {/* Middle Frame Layer */}
        <div
          className="w-full h-full rounded-3xl relative"
          style={{
            background: `
              linear-gradient(45deg,
                rgba(255, 255, 255, 0.08) 0%,
                transparent 25%,
                rgba(255, 255, 255, 0.03) 50%,
                transparent 75%,
                rgba(255, 255, 255, 0.08) 100%
              )
            `,
            padding: "2px",
            borderRadius: "21px",
          }}
        >
          {/* Inner Glow Ring */}
          <div
            className="w-full h-full rounded-3xl relative"
            style={{
              background: `
                linear-gradient(225deg,
                  rgba(0, 255, 200, 0.12) 0%,
                  rgba(100, 0, 255, 0.08) 30%,
                  transparent 60%,
                  rgba(255, 100, 200, 0.08) 100%
                )
              `,
              padding: "1px",
              borderRadius: "18px",
              boxShadow: `
                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                inset 0 -1px 0 rgba(255, 255, 255, 0.1),
                0 0 30px rgba(0, 255, 200, 0.1),
                0 0 60px rgba(100, 0, 255, 0.05)
              `,
            }}
          >
            <div
              className="w-full h-full px-6 py-4 flex flex-col rounded-2xl relative overflow-hidden "
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: `
                  linear-gradient(135deg,
                    rgba(8, 8, 15, 0.98) 0%,
                    rgba(15, 12, 25, 0.96) 25%,
                    rgba(12, 8, 20, 0.98) 50%,
                    rgba(18, 15, 30, 0.96) 75%,
                    rgba(10, 8, 18, 0.98) 100%
                  ),
                  radial-gradient(ellipse at top right,
                    rgba(0, 200, 255, 0.03) 0%,
                    transparent 50%
                  ),
                  radial-gradient(ellipse at bottom left,
                    rgba(255, 0, 128, 0.03) 0%,
                    transparent 50%
                  )
                `,
                backdropFilter: "blur(40px) saturate(180%)",

                boxShadow: `
                  inset 0 1px 0 rgba(255, 255, 255, 0.15),
                  inset 0 -1px 0 rgba(255, 255, 255, 0.05),
                  0 8px 32px rgba(0, 0, 0, 0.3),
                  0 2px 8px rgba(0, 0, 0, 0.2)
                `,
              }}
            >
              {/* Header - Fixed */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-white font-heading text-lg font-bold mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm">
                    {/* Subreddit Badge */}
                    <LiquidBadge variant="orange" size="md">
                      r/{post.subreddit}
                    </LiquidBadge>

                    {/* Author */}
                    <span className="text-white/60">by u/{post.author}</span>

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
                submitPostAction={submitPostAction}
                replySent={replySent}
                isSubmittingAction={isSubmittingAction}
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
    </div>
  );
}
