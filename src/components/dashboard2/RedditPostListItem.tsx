"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { RedditPost } from "@/types/brand";
import { useAgentReply } from "@/hooks/useAgentReply";
import { useProspectReplyAction } from "@/hooks/api/useProspectReplyAction";
import AgentReplyBox from "./AgentReplyBox";

interface RedditPostListItemProps {
  post: RedditPost;
  brandId?: string;
  prospectId?: string;
  onGenerate?: (post: RedditPost) => Promise<void>;
  onIgnore?: (post: RedditPost) => Promise<void>;
  onSend?: (post: RedditPost, message: string) => Promise<void>;
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

export default function RedditPostListItem({
  post,
  brandId = "",
  prospectId = "",
}: RedditPostListItemProps) {
  // Derived fields
  const postId = post.thing_id;
  const postTitle = post.title || "";
  const postContent = post.content;
  const postAuthor = post.author;
  const postSubreddit = post.subreddit;
  const postLink = `https://reddit.com${post.permalink}`;
  const postCreatedAt = new Date(post.created_utc * 1000).toISOString();
  const postUpVotes = post.upvotes || post.score || 0;
  const postNumComments = post.reply_count || 0;
  const llmExplanation = post.suggested_agent_reply || "";

  // Check if this is a RedditPost with suggested_agent_reply
  const hasSuggestedReply = !!post.suggested_agent_reply;

  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [customReply, setCustomReply] = useState<string>(
    post.suggested_agent_reply ?? ""
  );
  const [showReplyBox, setShowReplyBox] = useState(!!hasSuggestedReply);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [lastUsedAgentId, setLastUsedAgentId] = useState<string | null>(null);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [replySent, setReplySent] = useState(false);
  const { agents, isLoadingAgents, isGenerating, generateWithAgent } =
    useAgentReply(brandId);
  const replyMutation = useProspectReplyAction();

  // Check if we're returning from Reddit auth for this specific post
  useEffect(() => {
    // Check URL hash for post ID
    const hash = window.location.hash;
    if (hash === `#post-${postId}`) {
      // This is the post user was working on before redirect
      // Check for saved draft
      const draftKey: string = `reddit-reply-draft-${postId}`;
      const draftData = sessionStorage.getItem(draftKey);

      if (draftData) {
        // Open reply box automatically
        setShowReplyBox(true);

        // Scroll to this post after a brief delay to ensure DOM is ready
        setTimeout(() => {
          const element = document.getElementById(`post-${postId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);

        // Clear the hash after handling
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
    }
  }, [postId]);
  // const postStatus = post.status;

  // Extract mentioned brand from llm_explanation
  const mentionedBrand = llmExplanation
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

  const handleReplySubmit = async (content: string) => {
    try {
      await replyMutation.mutateAsync({
        brandId,
        prospectId: prospectId || post.thing_id,
        postId: post.thing_id,
        content,
        agentId: agents.length > 0 ? agents[0].id : undefined,
      });
      
      setReplySent(true);
      setTimeout(() => {
        setReplySent(false);
      }, 2500);
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("Failed to submit reply. Please try again.");
    }
  };

  async function submitPostAction(action: "reply" | "ignore", text?: string) {
    setIsSubmittingAction(true);
    try {
      const response = await fetch(`/api/brand/post/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_content_action: action === "reply" ? "reply" : "ignore",
          brand_name: undefined,
          brand_detail: undefined,
          problem: undefined,
          reddit_post: {
            thing_id: post.thing_id,
            title: post.title,
            content: post.content,
            author: post.author,
            subreddit: post.subreddit,
            permalink: post.permalink,
            created_utc: post.created_utc,
            score: post.score,
            upvotes: post.upvotes,
            downvotes: post.downvotes,
            reply_count: post.reply_count || 0,
            thumbnail: post.thumbnail,
            link_flair: post.link_flair,
            suggested_agent_reply: post.suggested_agent_reply || null,
            status: typeof post.status === "string" ? post.status : "PENDING",
          },
          reply_content: action === "reply" ? text || "" : undefined,
          agent_id:
            action === "reply"
              ? lastUsedAgentId || selectedAgentId || undefined
              : undefined,
          brand_id: brandId || "",
          prospect_id: prospectId || "",
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
  const contentToShow = postContent || "";
  const shouldShowExpandButton = contentToShow.length > 200;

  return (
    <div id={`post-${postId}`} className="group">
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
                in r/{postSubreddit}
              </span>
              <span className="text-white/40">•</span>
              <span className="font-body">
                {formatTimeAgo(postCreatedAt)} by {postAuthor}
              </span>
            </div>

            {/* Post title - Clickable */}
            <h3
              className="text-white font-heading text-xl md:text-2xl font-semibold leading-tight mb-3 hover:text-white/90 transition-colors cursor-pointer"
              onClick={() =>
                window.open(postLink, "_blank", "noopener,noreferrer")
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  window.open(postLink, "_blank", "noopener,noreferrer");
                }
              }}
              tabIndex={0}
              role="link"
              title="Open Reddit post in new tab"
            >
              {postTitle}
            </h3>

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

            {/* Tags removed with SubredditPost deprecation */}

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
                  <span className="font-medium">{postUpVotes}</span>
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
                  <span className="font-medium">{postNumComments}</span>
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
                onReplySubmit={handleReplySubmit}
                replySent={replySent}
                isSubmittingAction={replyMutation.isPending}
                post={post}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
