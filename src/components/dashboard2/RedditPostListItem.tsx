"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { SubredditPost } from "@/types/brand";
import TagBadge from "./TagBadge";
import { useAgentReply } from "@/hooks/useAgentReply";
import AgentReplyBox from "./AgentReplyBox";

interface RedditPostListItemProps {
  post: SubredditPost;
  onGenerate?: (post: SubredditPost) => Promise<void>;
  onIgnore?: (post: SubredditPost) => Promise<void>;
  onSend?: (post: SubredditPost, message: string) => Promise<void>;
}

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Agents will be used for reply generation instead of personas

export default function RedditPostListItem({ post }: RedditPostListItemProps) {
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [customReply, setCustomReply] = useState<string>("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [lastUsedAgentId, setLastUsedAgentId] = useState<string | null>(null);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [replySent, setReplySent] = useState(false);
  const { agents, isLoadingAgents, isGenerating, generateWithAgent } =
    useAgentReply();

  // Check if we're returning from Reddit auth for this specific post
  useEffect(() => {
    // Check URL hash for post ID
    const hash = window.location.hash;
    if (hash === `#post-${post.id}`) {
      // This is the post user was working on before redirect
      // Check for saved draft
      const draftKey = `reddit-reply-draft-${post.id}`;
      const draftData = sessionStorage.getItem(draftKey);
      
      if (draftData) {
        // Open reply box automatically
        setShowReplyBox(true);
        
        // Scroll to this post after a brief delay to ensure DOM is ready
        setTimeout(() => {
          const element = document.getElementById(`post-${post.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        
        // Clear the hash after handling
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, [post.id]);

  // Extract mentioned brand from llm_explanation
  const mentionedBrand = post.llm_explanation
    ?.match(
      /(?:mentions?|discusses?|talks? about)\s+([A-Za-z0-9\s]+?)(?:\s+(?:in|as|for|with|to|and|or|but|because|since|although|while|if|when|where|why|how|that|which|who|whom|whose)|\.|,|;|:|\?|!|$)/i
    )?.[1]
    ?.trim();

  const handleGenerateWithAgent = async (agentId?: string) => {
    const targetAgentId = agentId || selectedAgentId;
    if (!targetAgentId) return;
    try {
      const result = await generateWithAgent(targetAgentId, post, {
        autoReply: true,
      });
      if (result.content) {
        setCustomReply(result.content);
      }
      setLastUsedAgentId(targetAgentId);
    } catch (error) {
      console.error("Error generating reply with agent:", error);
      alert("Failed to generate reply. Please try again.");
    }
  };

  const handleRegenerate = async () => {
    if (!lastUsedAgentId) return;
    try {
      const result = await generateWithAgent(lastUsedAgentId, post, {
        autoReply: true,
      });
      if (result.content) {
        setCustomReply(result.content);
      }
    } catch (error) {
      console.error("Error regenerating reply with agent:", error);
      alert("Failed to regenerate reply.");
    }
  };

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

  async function submitPostAction(action: "reply" | "ignore", text?: string) {
    setIsSubmittingAction(true);
    try {
      const response = await fetch(`/api/brand/post/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: post.brand_id,
          problem_id: post.problem_id,
          subreddit_post_id: post.id,
          post_id: post.post_id,
          user_content_action: action,
          content: action === "reply" ? text || "" : undefined,
          agent_id:
            action === "reply" ? lastUsedAgentId || selectedAgentId : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit action");
      }

      if (action === "reply") {
        setReplySent(true);
        // Optionally reset confirmation after a short delay
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

  // Get truncated content for preview
  const contentToShow = post.content || "";
  const shouldShowExpandButton = contentToShow.length > 200;

  return (
    <div id={`post-${post.id}`} className="group">
      <div className="rounded-lg border border-[#343536] bg-[#1a1a1b] p-5 transition-colors duration-200 hover:border-[#4f5355]">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Subreddit mention */}
            <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
              {/* Reddit icon */}
              <Image
                src="/reddit.svg"
                alt="Reddit"
                width={16}
                height={16}
                className="w-4 h-4"
                aria-hidden={true}
              />
              <span className="font-body">
                Mention of{" "}
                {mentionedBrand && (
                  <span className="font-semibold text-orange-400">
                    {mentionedBrand}
                  </span>
                )}{" "}
                in r/{post.subreddit}
              </span>
              <span className="text-white/40">•</span>
              <span className="font-body">
                {formatTimeAgo(post.created_at)} by {post.author}
              </span>
            </div>

            {/* Post title - Clickable */}
            <h3
              className="text-white font-heading text-xl md:text-2xl font-semibold leading-tight mb-3 hover:text-white/90 transition-colors cursor-pointer"
              onClick={() =>
                window.open(post.link, "_blank", "noopener,noreferrer")
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  window.open(post.link, "_blank", "noopener,noreferrer");
                }
              }}
              tabIndex={0}
              role="link"
              title="Open Reddit post in new tab"
            >
              {post.title}
            </h3>

            {/* LLM Explanation */}
            {post.llm_explanation && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1 text-white/50 text-[11px] uppercase tracking-wide">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <span className="font-body">PlumSprout Idea</span>
                </div>
                <p className="text-white/60 font-body text-[13px] leading-relaxed">
                  {post.llm_explanation}
                </p>
              </div>
            )}

            {/* Post Content - Collapsible */}
            {contentToShow && (
              <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                  {false && shouldShowExpandButton && <div />}
                  <div
                    className="font-body text-[15px] md:text-[16px] leading-relaxed"
                    style={{
                      color: "#d7dadc",
                      overflow: isContentExpanded ? "visible" : "hidden",
                      maxHeight: isContentExpanded ? "none" : 240,
                      paddingTop: shouldShowExpandButton ? 8 : 0,
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize]}
                      components={markdownComponents}
                    >
                      {contentToShow}
                    </ReactMarkdown>
                  </div>
                  {!isContentExpanded && shouldShowExpandButton && (
                    <div
                      className="pointer-events-none absolute bottom-0 left-0 right-0 h-12"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(26,26,27,0), rgba(26,26,27,0.9))",
                      }}
                    />
                  )}
                </div>
                {shouldShowExpandButton && (
                  <div className="mt-2 flex justify-start">
                    <button
                      onClick={() => setIsContentExpanded(!isContentExpanded)}
                      className="text-white/60 hover:text-white transition-colors text-xs font-body flex items-center gap-1"
                    >
                      {isContentExpanded ? (
                        <>
                          <span>Collapse</span>
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
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>Expand</span>
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
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.potential_customer && (
                <TagBadge label="Potential Customer" variant="customer" />
              )}
              {post.tags.competitor_mention && (
                <TagBadge label="Competitor" variant="competitor" />
              )}
              {post.tags.own_mention && (
                <TagBadge label="Own Mention" variant="default" />
              )}
              {post.tags.positive_sentiment && (
                <TagBadge label="Positive" variant="positive" />
              )}
              {post.tags.negative_sentiment && (
                <TagBadge label="Negative" variant="negative" />
              )}
            </div>

            {/* Action bar with counters on the left */}
            <div
              className="flex items-center gap-3 pt-4 border-t border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left-aligned counters styled as badges */}
              <div className="flex items-center gap-2 text-white/70 font-body text-xs">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#343536] bg-[#272729]"
                  aria-label="Upvotes"
                  title="Upvotes"
                >
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
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                    />
                  </svg>
                  <span className="font-medium">{post.up_votes}</span>
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#343536] bg-[#272729]"
                  aria-label="Comments"
                  title="Comments"
                >
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="font-medium">{post.num_comments}</span>
                </span>
              </div>

              {/* Spacer to push actions to the right */}
              <div className="ml-auto flex items-center gap-3">
                <button
                  onClick={() => setShowReplyBox(!showReplyBox)}
                  disabled={isSubmittingAction}
                  className="px-4 py-2 rounded-xl font-body font-medium text-sm transition-all duration-300 hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.8))",
                    color: "white",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
                  }}
                >
                  {showReplyBox ? "Cancel" : "Reply"}
                </button>

                <button
                  onClick={() => submitPostAction("ignore")}
                  disabled={isSubmittingAction}
                  className="px-4 py-2 rounded-xl font-body font-medium text-sm transition-all duration-300 hover:scale-105"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {isSubmittingAction ? "Processing..." : "Ignore"}
                </button>
              </div>
            </div>

            {/* Reply box */}
            {showReplyBox && (
              <AgentReplyBox
                agents={agents}
                isLoadingAgents={isLoadingAgents}
                isGenerating={isGenerating}
                selectedAgentId={selectedAgentId}
                setSelectedAgentId={setSelectedAgentId}
                lastUsedAgentId={lastUsedAgentId}
                onGenerateWithAgent={handleGenerateWithAgent}
                onRegenerate={handleRegenerate}
                customReply={customReply}
                setCustomReply={setCustomReply}
                submitPostAction={submitPostAction}
                replySent={replySent}
                isSubmittingAction={isSubmittingAction}
                post={post}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
