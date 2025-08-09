"use client";

import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { SubredditPost } from "@/types/brand";
import TagBadge from "./TagBadge";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import Image from "next/image";
import { ensureRedditConnectedOrRedirect } from "@/lib/verify-reddit";

interface RedditPostListItemProps {
  post: SubredditPost;
  onGenerate?: (post: SubredditPost) => void;
  onIgnore?: (post: SubredditPost) => void;
  onSend?: (post: SubredditPost, replyText: string) => void;
}

export default function RedditPostListItem({
  post,
  onGenerate,
  onIgnore,
  onSend,
}: RedditPostListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showGenerateOptions, setShowGenerateOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [replyText]);
  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  // Extract mention info (e.g., "todoist" from the llm_explanation)
  const mentionedBrand = useMemo(() => {
    const match = post?.llm_explanation?.match(
      /\b(todoist|ticktick|notion|obsidian)\b/i
    );
    return match ? match[1].toLowerCase() : null;
  }, [post?.llm_explanation]);

  const contentToRender = post.content?.trim()?.length ? post.content : "";

  const stopPropagation = (e: MouseEvent) => e.stopPropagation();

  async function submitPostAction(action: "reply" | "ignore", text?: string) {
    try {
      setIsSubmittingAction(true);
      const payload: Record<string, unknown> = {
        brand_id: post.brand_id,
        use_case_id: post.use_case_id,
        subreddit_post_id: post.id,
        post_id: post.post_id,
        user_content_action: action,
      };
      if (action === "reply" && text) {
        payload.content = text;
      }

      const resp = await fetch("/api/brand/post/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.warn("Failed to submit post action:", errText);
        return;
      }

      // Optional: handle response
      // const data = await resp.json();
    } finally {
      setIsSubmittingAction(false);
    }
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => window.open(post.link, "_blank", "noopener,noreferrer")}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.open(post.link, "_blank", "noopener,noreferrer");
        }
      }}
      className="group"
    >
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-lg p-5 hover:bg-[#272729] transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Subreddit mention */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              {/* Reddit icon */}
              <Image
                src="/reddit.svg"
                alt="Reddit"
                width={16}
                height={16}
                className="w-4 h-4"
                aria-hidden={true}
              />
              <span>
                Mention of{" "}
                {mentionedBrand && (
                  <span className="font-semibold text-[#FF4500]">
                    {mentionedBrand}
                  </span>
                )}{" "}
                in r/{post.subreddit}
              </span>
              <span className="text-gray-500">•</span>
              <span>
                {formatTimeAgo(post.created_at)} by {post.author}
              </span>
            </div>

            {/* Post title */}
            <h3 className="text-white text-lg font-semibold mb-3 group-hover:underline">
              {post.title}
            </h3>

            {/* LLM Explanation */}
            {post.llm_explanation && (
              <div className="text-gray-400 text-sm italic mb-3 p-2 bg-[#2A2A2B] border-l-2 border-[#4FBCFF] rounded-r">
                <span className="text-gray-500 text-xs uppercase tracking-wide">
                  PlumSprout AI Explanation:
                </span>
                <div className="mt-1">{post.llm_explanation}</div>
              </div>
            )}

            {/* Post content preview */}
            {contentToRender && (
              <div
                className={`text-gray-100 text-base font-medium ${
                  !isExpanded ? "line-clamp-6" : ""
                } whitespace-pre-wrap break-words`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                  components={{
                    a: (props) => (
                      <a
                        {...props}
                        className="text-[#4FBCFF] underline hover:opacity-90"
                        onClick={stopPropagation}
                      />
                    ),
                    code: ({ className, children, ...props }) => (
                      <code
                        className={`bg-[#272729] border border-[#343536] px-1 py-0.5 rounded ${
                          className || ""
                        }`}
                        {...props}
                      >
                        {children}
                      </code>
                    ),
                  }}
                >
                  {contentToRender}
                </ReactMarkdown>
              </div>
            )}

            {post.image && (
              <div className="mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image}
                  alt="post image"
                  className="w-full h-auto rounded-md border border-white/10"
                />
              </div>
            )}

            {/* Expand/Collapse button */}
            {contentToRender && contentToRender.length > 300 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsExpanded((prev) => !prev);
                }}
                className="mt-2 text-gray-400 hover:text-gray-300 text-sm flex items-center gap-1"
              >
                {isExpanded ? (
                  <>
                    Show less <ChevronUpIcon className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDownIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.negative_sentiment && (
                <TagBadge label="Negative" variant="negative" />
              )}
              {post.tags.positive_sentiment && (
                <TagBadge label="Positive" variant="positive" />
              )}
              {post.tags.neutral_sentiment && (
                <TagBadge label="Neutral" variant="neutral" />
              )}
              {post.tags.competitor_mention && (
                <TagBadge label="Competitor Mention" variant="competitor" />
              )}
              {post.tags.potential_customer && (
                <TagBadge label="Potential Customer" variant="customer" />
              )}
              {post.tags.own_mention && (
                <TagBadge label="Own Mention" variant="default" />
              )}
            </div>
          </div>

          {/* Post stats */}
          <div className="flex flex-col items-end gap-2 ml-4">
            <div className="flex items-center gap-1 text-sm text-gray-400">
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
                  d="M5 15l7-7 7 7"
                />
              </svg>
              {post.up_votes}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
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
              {post.num_comments}
            </div>
          </div>
        </div>
        {/* CTA: Respond section */}
        <div
          className="mt-4 border-t border-[#343536] pt-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top actions */}
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                showGenerateOptions
                  ? "bg-[#2F2F31] text-gray-400 opacity-60"
                  : "bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 text-purple-400 hover:text-purple-300 shadow-sm hover:shadow-md"
              }`}
              aria-label="Generate suggested reply"
              onClick={(e) => {
                e.stopPropagation();
                ensureRedditConnectedOrRedirect().then((ok) => {
                  if (!ok) return;
                  setShowGenerateOptions((prev) => !prev);
                  if (!showGenerateOptions) {
                    setSelectedOption(null);
                  }
                });
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Generate
            </button>
          </div>

          {showGenerateOptions && (
            <div className="mb-3">
              <div className="options-animate flex flex-wrap gap-2 p-2 rounded-md bg-[#202021] border border-[#343536] shadow-md">
                {[
                  {
                    label: "Motivate",
                    prompt:
                      "Motivational and encouraging, in the spirit of Tony Robbins (tone only, no direct impersonation). 2–4 sentences. Conversational and human. No corporate speak or sales pitch.",
                  },
                  {
                    label: "Sympathize",
                    prompt:
                      "Empathetic and understanding, in the spirit of Mister Rogers (tone only, no direct impersonation). 2–4 sentences. Warm, kind, and human.",
                  },
                  {
                    label: "Joke",
                    prompt:
                      "Witty with light humor, in the spirit of Dave Chappelle (tone only, no direct impersonation). 2–4 sentences. Keep it respectful and friendly.",
                  },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors border disabled:opacity-50 ${
                      selectedOption === opt.label
                        ? "bg-[#4FBCFF]/20 border-[#4FBCFF]/40 text-[#4FBCFF]"
                        : "bg-[#2A2A2B] hover:bg-[#333336] text-gray-100 border-[#3d3e40]"
                    }`}
                    onClick={async (e) => {
                      e.stopPropagation();
                      setIsGenerating(true);
                      setSelectedOption(opt.label);

                      try {
                        const resp = await fetch("/api/generate/reply", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            post_content: post.content || post.title,
                            prompt: opt.prompt,
                          }),
                        });
                        if (!resp.ok) {
                          console.warn("Failed to generate reply");
                          return;
                        }
                        const data: { generated_reply?: string } =
                          await resp.json();
                        if (data?.generated_reply) {
                          // Overwrite the reply text instead of appending
                          setReplyText(data.generated_reply);
                        }
                      } finally {
                        setIsGenerating(false);
                      }
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reply textarea */}
          <div className="mb-3 relative">
            <label htmlFor={`reply-${post.id}`} className="sr-only">
              Your reply
            </label>
            <textarea
              id={`reply-${post.id}`}
              ref={textareaRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Type your reply here..."
              className="w-full min-h-[88px] rounded-md bg-[#0f0f0f] text-gray-100 placeholder-gray-500 border border-[#343536] focus:outline-none focus:ring-2 focus:ring-[#4FBCFF] focus:border-transparent p-3 overflow-hidden resize-none"
            />
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f]/80 rounded-md backdrop-blur-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="dots" aria-hidden>
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="text-sm">Generating reply...</span>
                </div>
              </div>
            )}
          </div>

          {/* Send and Ignore buttons */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-sm bg-[#272729] hover:bg-[#2F2F31] text-gray-200 rounded-md transition-colors border border-[#343536]"
              aria-label="Ignore this post"
              onClick={(e) => {
                e.stopPropagation();
                if (onIgnore) {
                  onIgnore(post);
                  return;
                }
                // Default behavior: call backend to mark as ignored
                submitPostAction("ignore");
              }}
            >
              Ignore
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm bg-[#4FBCFF] hover:bg-[#3FAAE9] text-black font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send reply"
              disabled={!replyText.trim() || isSubmittingAction}
              onClick={(e) => {
                e.stopPropagation();
                const text = replyText.trim();
                if (!text) return;
                ensureRedditConnectedOrRedirect().then((ok) => {
                  if (!ok) return;
                  if (onSend) {
                    onSend(post, text);
                    return;
                  }
                  // Default behavior: call backend to send reply
                  submitPostAction("reply", text);
                });
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .options-animate {
          animation: fadeUp 180ms ease-out;
        }
        .dots {
          display: inline-flex;
          gap: 3px;
          margin-left: 2px;
        }
        .dots > span {
          width: 5px;
          height: 5px;
          border-radius: 9999px;
          background: #9ca3af; /* gray-400 */
          opacity: 0.6;
          animation: dotPulse 1.2s infinite ease-in-out;
        }
        .dots > span:nth-child(2) {
          animation-delay: 0.15s;
        }
        .dots > span:nth-child(3) {
          animation-delay: 0.3s;
        }
        @keyframes dotPulse {
          0%,
          80%,
          100% {
            transform: scale(0.6);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
