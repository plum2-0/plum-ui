"use client";

import { useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { RedditConvo, RedditThreadNode, RedditAction } from "@/types/agent";
import { getBrandIdFromCookie } from "@/lib/cookies";

interface RedditAgentThreadProps {
  redditConvo: RedditConvo;
  onExpand?: (conversationId: string) => void;
  onCollapse?: (conversationId: string) => void;
  agentName?: string;
  agentAvatarUrl?: string;
}

// Helper function to format time ago
function formatTimeAgo(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

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

export default function RedditAgentThread({
  redditConvo,
  onExpand,
  onCollapse,
  agentName,
  agentAvatarUrl,
}: RedditAgentThreadProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [fullThread, setFullThread] = useState<RedditThreadNode | null>(null);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [isUpdatingAction, setIsUpdatingAction] = useState<string | null>(null);

  const { parentPost, parentReply } = redditConvo;
  const [localActions, setLocalActions] = useState(redditConvo.actions);
  const hasMoreReplies = localActions.length > 0;

  // Group actions by status, prioritizing pending
  const pendingActions = localActions.filter(
    (a) => (a.status ?? "") === "pending"
  );
  const completedActions = localActions.filter(
    (a) => (a.status ?? "") === "completed" || (a.status ?? "") === "replied"
  );
  const scheduledActions = localActions.filter(
    (a) => (a.status ?? "") === "scheduled"
  );
  const dismissedActions = localActions.filter(
    (a) => (a.status ?? "") === "dismissed"
  );

  const updateActionStatus = async (actionId: string, newStatus: string) => {
    try {
      setIsUpdatingAction(actionId);
      const brandId = getBrandIdFromCookie();
      if (!brandId) throw new Error("No brand selected");
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(
        `${backendUrl}/api/engagement/${brandId}/actions/${actionId}/status?status=${encodeURIComponent(
          newStatus
        )}`,
        { method: "PUT" }
      );
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Failed to update action status");
      }
      // Optimistically update local actions
      setLocalActions((prev) =>
        prev.map((a) =>
          a.actionId === actionId ? { ...a, status: newStatus } : a
        )
      );
    } catch (e) {
      console.error(e);
      alert((e as Error).message);
    } finally {
      setIsUpdatingAction(null);
    }
  };

  const handleToggleExpand = async () => {
    if (!isExpanded && !fullThread && hasMoreReplies) {
      setLoadingThread(true);
      try {
        // Fetch from API (currently returns mock data)
        const response = await fetch(`/api/reddit/thread/${parentPost.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch thread");
        }
        const threadData = await response.json();

        // Merge with our actions data for a richer display
        const enrichedThread: RedditThreadNode = {
          ...threadData,
          id: parentReply.id,
          author: parentReply.author,
          body: parentReply.content,
          score: parentReply.upvotes || threadData.score,
          created_utc: new Date(parentReply.createdAt).getTime() / 1000,
          permalink: parentReply.permalink,
          replies: [
            ...localActions.map((action: RedditAction, idx: number) => ({
              id: `action-${idx}`,
              author: action.userPost.author,
              body: action.userPost.content,
              score: Math.floor(Math.random() * 50) + 1,
              created_utc: Date.now() / 1000 - idx * 3600,
              permalink: "",
              replies: action.agentReply
                ? [
                    {
                      id: `agent-reply-${idx}`,
                      author: parentReply.author,
                      body: action.agentReply.content,
                      score: Math.floor(Math.random() * 30) + 1,
                      created_utc: Date.now() / 1000 - idx * 3600 + 1800,
                      permalink: "",
                      replies: [],
                    },
                  ]
                : [],
            })),
            ...threadData.replies,
          ],
        };
        setFullThread(enrichedThread);
      } catch (error) {
        console.error("Failed to load thread:", error);
      } finally {
        setLoadingThread(false);
      }
    }

    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      onExpand?.(parentPost.id);
    } else {
      onCollapse?.(parentPost.id);
    }
  };

  const renderRedditComment = (
    node: RedditThreadNode,
    depth: number = 0,
    isAgent: boolean = false
  ) => {
    const isAgentComment = node.author === parentReply.author || isAgent;

    return (
      <div key={node.id} className="mb-2">
        {/* Comment Thread Line */}
        {depth > 0 && (
          <div
            className="absolute left-0 top-0 bottom-0 w-[2px] hover:bg-white/20 transition-colors cursor-pointer"
            style={{
              marginLeft: `${(depth - 1) * 24 + 12}px`,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
            onClick={handleToggleExpand}
          />
        )}

        <div style={{ marginLeft: `${depth * 24}px` }}>
          <div className="rounded-md p-3 hover:bg-white/[0.03] transition-colors">
            {/* Comment Header */}
            <div className="flex items-center gap-2 mb-2 text-xs">
              {isAgentComment && (
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-green-500 shrink-0" />
              )}
              <span
                className={`font-body font-medium ${
                  isAgentComment ? "text-green-400" : "text-white/60"
                }`}
              >
                u/{node.author}
              </span>
              {isAgentComment && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 font-body">
                  AGENT
                </span>
              )}
              <span className="text-white/40">•</span>
              <span className="text-white/40 font-body">
                {node.score} {node.score === 1 ? "point" : "points"}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-white/40 font-body">
                {formatTimeAgo(new Date(node.created_utc * 1000))}
              </span>
            </div>

            {/* Comment Body */}
            <div className="text-[#d7dadc] text-sm font-body leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={markdownComponents}
              >
                {node.body}
              </ReactMarkdown>
            </div>

            {/* Comment Actions */}
            <div className="flex items-center gap-3 mt-2">
              <button className="flex items-center gap-1 text-white/40 hover:text-white/60 transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
              <button className="flex items-center gap-1 text-white/40 hover:text-white/60 transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <button className="text-white/40 hover:text-white/60 text-xs font-body transition-colors">
                Reply
              </button>
              <button className="text-white/40 hover:text-white/60 text-xs font-body transition-colors">
                Share
              </button>
            </div>
          </div>

          {/* Nested Replies */}
          {node.replies.length > 0 && (
            <div className="relative">
              {node.replies.map((reply) =>
                renderRedditComment(reply, depth + 1, isAgentComment)
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get truncated content for preview
  const contentToShow = parentPost.content || "";
  const shouldShowExpandButton = contentToShow.length > 300;

  return (
    <div className="group">
      <div className="rounded-lg border border-[#343536] bg-[#1a1a1b] p-5 transition-colors duration-200 hover:border-[#4f5355]">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Subreddit info */}
            <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
              <Image
                src="/reddit.svg"
                alt="Reddit"
                width={16}
                height={16}
                className="w-4 h-4"
                aria-hidden={true}
              />
              <span className="font-body">
                Agent conversation in r/{parentPost.platform}
              </span>
              <span className="text-white/40">•</span>
              <span className="font-body">
                {formatTimeAgo(parentPost.createdAt)} by u/{parentPost.author}
              </span>
            </div>

            {/* Post title/content */}
            <h3
              className="text-white font-heading text-xl md:text-2xl font-semibold leading-tight mb-3 hover:text-white/90 transition-colors cursor-pointer"
              onClick={() =>
                window.open(
                  parentPost.permalink,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  window.open(
                    parentPost.permalink,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }
              }}
              tabIndex={0}
              role="link"
              title="Open Reddit post in new tab"
            >
              {contentToShow.substring(0, 150)}
              {contentToShow.length > 150 && "..."}
            </h3>

            {/* Post Content - Collapsible */}
            {contentToShow && (
              <div className="mb-4">
                <div className="relative">
                  {shouldShowExpandButton && (
                    <div className="absolute right-0 -top-1 z-10">
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
              </div>
            )}

            {/* Post stats styled as badges */}
            <div className="flex items-center gap-3 text-white/70 font-body text-xs mb-4">
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
                <span className="font-medium">{parentPost.upvotes || 0}</span>
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
                <span className="font-medium">
                  {parentPost.replyCount || 0}
                </span>
              </span>
            </div>

            {/* Agent's Initial Reply */}
            <div className="border-t border-white/10 pt-4">
              <div className="rounded-md p-3 bg-green-500/5 border border-green-500/20">
                {/* Agent Reply Header */}
                <div className="flex items-center gap-2 mb-2 text-xs">
                  {agentAvatarUrl ? (
                    <Image
                      src={agentAvatarUrl}
                      alt={agentName ? `${agentName} avatar` : "Agent avatar"}
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-full shrink-0"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-green-500 shrink-0" />
                  )}
                  <span className="font-body font-medium text-green-400">
                    u/{parentReply.author}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 font-body">
                    AGENT
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/40 font-body">
                    {parentReply.upvotes || 0} points
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/40 font-body">
                    {formatTimeAgo(parentReply.createdAt)}
                  </span>
                </div>

                {/* Agent Reply Body */}
                <div className="text-[#d7dadc] text-sm font-body leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={markdownComponents}
                  >
                    {parentReply.content}
                  </ReactMarkdown>
                </div>

                {/* Reply Actions */}
                <div className="flex items-center gap-3 mt-2">
                  <button className="flex items-center gap-1 text-white/40 hover:text-white/60 transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </button>
                  <button className="flex items-center gap-1 text-white/40 hover:text-white/60 transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <button className="text-white/40 hover:text-white/60 text-xs font-body transition-colors">
                    Reply
                  </button>
                  <button className="text-white/40 hover:text-white/60 text-xs font-body transition-colors">
                    Share
                  </button>
                </div>
              </div>

              {/* Expand/Collapse Thread Button */}
              {hasMoreReplies && (
                <button
                  onClick={handleToggleExpand}
                  disabled={loadingThread}
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-body transition-all mt-3 ml-3"
                >
                  {loadingThread ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                      Loading thread...
                    </>
                  ) : (
                    <>
                      <span className="text-[13px]">
                        {isExpanded ? "[-]" : "[+]"}{" "}
                        {isExpanded ? "Collapse" : "View"} {localActions.length}{" "}
                        more {localActions.length === 1 ? "reply" : "replies"}
                      </span>
                    </>
                  )}
                </button>
              )}

              {/* Actions Panel */}
              {localActions.length > 0 && (
                <div className="mt-4 ml-3 space-y-3">
                  {/* Pending first */}
                  {pendingActions.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {agentAvatarUrl ? (
                          <Image
                            src={agentAvatarUrl}
                            alt={
                              agentName ? `${agentName} avatar` : "Agent avatar"
                            }
                            width={20}
                            height={20}
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-green-500" />
                        )}
                        <div className="text-white/80 font-body text-xs">
                          {agentName ?? "Agent"} has pending actions
                        </div>
                        <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-body bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          Pending
                        </span>
                      </div>
                      <div className="space-y-2">
                        {pendingActions.map((a) => (
                          <div
                            key={a.actionId || a.userPost.thing_id}
                            className="rounded-lg border border-[#343536] bg-[#1a1a1b] p-3 hover:border-[#4f5355] transition-colors"
                          >
                            {/* Reddit-like user comment */}
                            <div className="flex gap-3">
                              {/* Vote column */}
                              <div className="flex flex-col items-center text-white/40 mt-0.5 select-none">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                                <span className="text-xs">
                                  {a.userPost.score ?? ""}
                                </span>
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                              {/* Comment body */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 text-xs">
                                  <span className="font-body text-white/70">
                                    u/{a.userPost.author}
                                  </span>
                                  <span className="text-white/40">•</span>
                                  <span className="text-white/40 font-body">
                                    just now
                                  </span>
                                </div>
                                <div className="font-body text-[14px] leading-relaxed text-[#d7dadc]">
                                  {a.userPost.content}
                                </div>
                              </div>
                            </div>

                            {/* Agent pending reply well */}
                            {a.agentReply?.content && (
                              <div className="mt-3 ml-8 rounded-md border border-green-500/30 bg-green-500/10 p-3">
                                <div className="flex items-center gap-2 mb-1 text-xs">
                                  {agentAvatarUrl ? (
                                    <Image
                                      src={agentAvatarUrl}
                                      alt={
                                        agentName
                                          ? `${agentName} avatar`
                                          : "Agent avatar"
                                      }
                                      width={16}
                                      height={16}
                                      className="w-4 h-4 rounded-full"
                                    />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-green-500" />
                                  )}
                                  <span className="font-body text-green-400">
                                    {agentName ?? "Agent"}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-300 font-body border border-yellow-500/30">
                                    Pending
                                  </span>
                                </div>
                                <div className="text-[#d7dadc] text-sm font-body leading-relaxed">
                                  {a.agentReply.content}
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="mt-3 flex items-center justify-end gap-2">
                              <button
                                disabled={!!isUpdatingAction}
                                onClick={() =>
                                  a.actionId &&
                                  updateActionStatus(a.actionId, "completed")
                                }
                                className="px-3 py-1 rounded-xl text-xs font-body font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                style={{
                                  background:
                                    "linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.8))",
                                  color: "white",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(34, 197, 94, 0.3)",
                                  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
                                }}
                              >
                                {isUpdatingAction === a.actionId
                                  ? "..."
                                  : "Accept"}
                              </button>
                              <button
                                disabled={!!isUpdatingAction}
                                onClick={() =>
                                  a.actionId &&
                                  updateActionStatus(a.actionId, "dismissed")
                                }
                                className="px-3 py-1 rounded-xl text-xs font-body font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                style={{
                                  background: "rgba(255, 255, 255, 0.1)",
                                  color: "white",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(255, 255, 255, 0.2)",
                                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                }}
                              >
                                {isUpdatingAction === a.actionId
                                  ? "..."
                                  : "Cancel"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scheduled */}
                  {scheduledActions.length > 0 && (
                    <div>
                      <div className="text-white/70 font-body text-xs mb-2">
                        Scheduled
                      </div>
                      <div className="space-y-2">
                        {scheduledActions.map((a) => (
                          <div
                            key={a.actionId || a.userPost.thing_id}
                            className="rounded-md border border-white/10 p-3 text-sm text-white/70 font-body"
                          >
                            <span className="text-white/60">User:</span>{" "}
                            {a.userPost.author}
                            <div className="text-white/60 mt-1">
                              "{a.userPost.content}"
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed */}
                  {completedActions.length > 0 && (
                    <div>
                      <div className="text-white/70 font-body text-xs mb-2">
                        Completed
                      </div>
                      <div className="space-y-2">
                        {completedActions.map((a) => (
                          <div
                            key={a.actionId || a.userPost.thing_id}
                            className="rounded-md border border-white/10 p-3 text-sm text-white/70 font-body"
                          >
                            <span className="text-white/60">User:</span>{" "}
                            {a.userPost.author}
                            <div className="text-white/60 mt-1">
                              "{a.userPost.content}"
                            </div>
                            {a.agentReply?.content && (
                              <div className="text-white/70 mt-2">
                                <span className="px-1.5 py-0.5 mr-2 rounded text-[10px] bg-green-500/20 text-green-400 font-body">
                                  AGENT REPLY
                                </span>
                                {a.agentReply.content}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dismissed */}
                  {dismissedActions.length > 0 && (
                    <div>
                      <div className="text-white/70 font-body text-xs mb-2">
                        Dismissed
                      </div>
                      <div className="space-y-2">
                        {dismissedActions.map((a) => (
                          <div
                            key={a.actionId || a.userPost.thing_id}
                            className="rounded-md border border-white/10 p-3 text-sm text-white/60 font-body"
                          >
                            <span className="text-white/50">User:</span>{" "}
                            {a.userPost.author}
                            <div className="text-white/50 mt-1">
                              "{a.userPost.content}"
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Expanded Thread */}
              {isExpanded && fullThread && (
                <div className="mt-3 animate-fade-in relative">
                  {fullThread.replies.map((reply) =>
                    renderRedditComment(reply, 1)
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
