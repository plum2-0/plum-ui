"use client";

import { RedditPost } from "@/types/brand";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { useGenerateReply } from "@/hooks/useGenerateReply";
import SimplifiedAgentReply from "./SimplifiedAgentReply";

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
  const [isExpanded, setIsExpanded] = useState(false);
  // const [showReplyBox, setShowReplyBox] = useState(false);

  const [customReply, setCustomReply] = useState<string>("");
  const [replySent, setReplySent] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const { agents, isLoadingAgents, isGenerating, generateWithAgent } =
    useGenerateReply(brandId);

  // Format timestamp
  const timeAgo = formatDistanceToNow(new Date(post.created_utc * 1000), {
    addSuffix: true,
  });

  // Truncate content for preview
  const maxLength = 280;
  const shouldTruncate = post.content && post.content.length > maxLength;

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
      className={`w-full max-w-4xl rounded-2xl p-6 flex flex-col ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        minHeight: "400px",
        maxHeight: "80vh",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-white font-heading text-lg font-bold mb-2 line-clamp-2">
            {post.title}
          </h3>
          <div className="flex items-center gap-3 text-sm">
            {/* Subreddit Badge */}
            <div
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(254, 215, 170, 0.2))",
                border: "1px solid rgba(251, 146, 60, 0.3)",
              }}
            >
              <span className="text-orange-300 font-medium">
                r/{post.subreddit}
              </span>
            </div>

            {/* Author */}
            <span className="text-white/60">by u/{post.author}</span>

            {/* Time */}
            <span className="text-white/40">{timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Content - Make it scrollable if needed */}
      {post.content && (
        <div className="flex-1 mb-4 min-h-0">
          <div
            className="text-white/80 font-body text-sm leading-relaxed overflow-y-auto"
            style={{
              height: isExpanded ? "100%" : "auto",
              maxHeight: isExpanded ? "100%" : "150px",
              paddingRight: "8px",
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
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {/* Action Buttons - Keep at bottom */}
      <div className="flex items-center justify-between gap-4 pt-4 mt-auto border-t border-white/10">
        {/* Metrics */}
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
            <span className="text-white/70 text-sm">{post.reply_count}</span>
          </div>

          {/* Link Flair */}
          {post.link_flair && (
            <div
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                background: "rgba(168, 85, 247, 0.2)",
                color: "rgb(216, 180, 254)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
              }}
            >
              {post.link_flair}
            </div>
          )}
        </div>
      </div>

      {/* Reply box */}
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
        <div
          className="mt-4 p-3 rounded-lg overflow-y-auto"
          style={{
            background:
              "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(168, 85, 247, 0.1))",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            maxHeight: "120px",
          }}
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
            <span className="text-emerald-300 text-xs font-semibold">
              Suggested Reply
            </span>
          </div>
          <p className="text-white/70 text-xs font-body leading-relaxed">
            {post.suggested_agent_reply}
          </p>
        </div>
      )}
    </div>
  );
}
