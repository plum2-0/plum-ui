"use client";

import { RedditPost } from "@/types/brand";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import Link from "next/link";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useProspectPostAction } from "@/hooks/api/useProspectPostAction";

interface ProspectCardProps {
  post: any;
  className?: string;
  onReply?: () => void;
  fitContent?: boolean;
  flatBackground?: boolean;
  brandId?: string;
  prospectId?: string;
  brandName?: string;
  brandDetail?: string;
  problem?: string;
}

export default function ProspectCard({
  post,
  className = "",
  fitContent = false,
  flatBackground = false,
  brandId,
  brandName,
  brandDetail,
  problem,
}: ProspectCardProps) {
  const [showScrollFade, setShowScrollFade] = useState(true);
  const [contentRef, setContentRef] = useState<HTMLDivElement | null>(null);
  const postActionMutation = useProspectPostAction();

  // Debug logging
  console.log("ProspectCard debug:", {
    brandId,
    postKeys: Object.keys(post),
    prospectId: post,
  });

  // Handle queue action
  const handleQueue = async () => {
    if (!brandId || !post.prospect_id) {
      console.warn("Missing brandId or prospectId for queue action", {
        brandId,
        prospectId: post.prospect_id,
        postKeys: Object.keys(post),
      });
      return;
    }

    try {
      await postActionMutation.mutateAsync({
        post,
        action: "queue",
        brandId,
        prospectId: post.prospect_id,
        brandName,
        brandDetail,
        problem,
      });
    } catch (error) {
      console.error("Failed to queue post:", error);
    }
  };

  // Handle ignore action
  const handleIgnore = async () => {
    if (!brandId || !post.prospect_id) {
      console.warn("Missing brandId or prospectId for ignore action", {
        brandId,
        prospectId: post.prospect_id,
        postKeys: Object.keys(post),
      });
      return;
    }

    try {
      await postActionMutation.mutateAsync({
        post,
        action: "ignore",
        brandId,
        prospectId: post.prospect_id,
        brandName,
        brandDetail,
        problem,
      });
    } catch (error) {
      console.error("Failed to ignore post:", error);
    }
  };

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
    a: (props) => <a {...props} className="text-[#4fbcff] hover:underline" />,
    p: (props) => <p {...props} className="mb-2 text-[#d7dadc]" />,
    ul: (props) => (
      <ul {...props} className="list-disc pl-5 mb-2 text-[#d7dadc]" />
    ),
    ol: (props) => (
      <ol {...props} className="list-decimal pl-5 mb-2 text-[#d7dadc]" />
    ),
    li: (props) => <li {...props} className="mb-0.5" />,
    img: (props) => {
      const { src = "", alt = "" } =
        props as React.ImgHTMLAttributes<HTMLImageElement>;
      const isSafeSrc =
        typeof src === "string" &&
        (src.startsWith("https://") || src.startsWith("http://"));
      if (!isSafeSrc) return null;
      return (
        <span className="block my-2 rounded overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="block w-full h-auto object-contain"
            style={{ maxHeight: 320 }}
          />
        </span>
      );
    },
    blockquote: (props) => (
      <blockquote
        {...props}
        className="border-l-4 border-[#343536] pl-3 text-[#818384] italic my-2"
      />
    ),
    code: (props: any) => {
      const { inline, children, ...rest } = props;
      if (inline) {
        return (
          <code
            {...rest}
            className="bg-[#272729] text-[#d7dadc] px-1 py-0.5 rounded text-sm"
          >
            {children}
          </code>
        );
      }
      return (
        <span className="block bg-[#161617] text-[#d7dadc] p-2 rounded overflow-auto mb-2 border border-[#343536]">
          <code
            {...rest}
            className="block whitespace-pre-wrap font-mono text-xs"
          >
            {children}
          </code>
        </span>
      );
    },
    h1: (props) => (
      <h1 {...props} className="text-lg font-semibold mb-1.5 text-[#d7dadc]" />
    ),
    h2: (props) => (
      <h2
        {...props}
        className="text-base font-semibold mb-1.5 text-[#d7dadc]"
      />
    ),
    h3: (props) => (
      <h3 {...props} className="text-sm font-semibold mb-1 text-[#d7dadc]" />
    ),
  };

  // Sanitize schema allowing safe images and link attributes
  const sanitizeSchema = {
    ...(defaultSchema as any),
    tagNames: [...(((defaultSchema as any).tagNames as string[]) || []), "img"],
    attributes: {
      ...(((defaultSchema as any).attributes as Record<string, any[]>) || {}),
      img: ["src", "alt", "title", "width", "height"],
      a: ["href", "title", "target", "rel"],
    },
  } as any;

  return (
    <div
      className={`relative w-full max-w-4xl ${className}`}
      style={{
        height: fitContent ? "auto" : "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Reddit-like card with Plum accent */}
      <div
        className={`${
          flatBackground ? "relative" : "absolute inset-0"
        } rounded-xl`}
        style={{
          background: "#1a1a1b",
          border: "1px solid rgba(129, 102, 255, 0.15)",
          boxShadow:
            "0 2px 8px rgba(0, 0, 0, 0.4), 0 0 20px rgba(129, 102, 255, 0.05)",
        }}
      >
        {/* Inner Container */}
        <div
          className="w-full rounded-xl relative overflow-hidden"
          style={{ height: fitContent ? "auto" : "100%" }}
        >
          <div
            className="w-full px-4 py-3 flex flex-col rounded-xl relative overflow-visible"
            style={{
              height: fitContent ? "auto" : "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header - Fixed */}
            <div className="mb-3">
              {/* Meta info bar - Reddit style */}
              <div className="flex items-center gap-2 text-xs mb-2">
                <Link
                  href={`https://reddit.com/r/${post.subreddit}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#d7dadc] hover:text-white transition-colors"
                >
                  r/{post.subreddit}
                </Link>
                <span className="text-[#818384]">•</span>
                <span className="text-[#818384]">
                  Posted by{" "}
                  <Link
                    href={`https://reddit.com/user/${post.author}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    u/{post.author}
                  </Link>
                </span>
                <span className="text-[#818384]">{timeAgo}</span>
                {/* Link Flair inline */}
                {post.link_flair && (
                  <>
                    <span className="text-[#818384]">•</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30">
                      {post.link_flair}
                    </span>
                  </>
                )}
              </div>
              {/* Title */}
              <Link
                href={`https://reddit.com${post.permalink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <h3 className="text-white font-semibold text-lg leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-[#8b5cf6] cursor-pointer">
                  {post.title}
                </h3>
              </Link>
            </div>

            {/* Content - Scrollable or natural height based on fitContent */}
            {post.content && (
              <div
                className={`${
                  fitContent ? "" : "flex-1 min-h-0"
                } mb-2 relative`}
              >
                <div
                  ref={setContentRef}
                  className={`text-[#d7dadc] text-sm leading-relaxed pr-2 ${
                    fitContent ? "overflow-visible" : "overflow-y-auto h-full"
                  }`}
                  style={{
                    maxHeight: fitContent ? "none" : "100%",
                  }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
                    components={markdownComponents}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>
                {/* Fade gradient indicator at bottom when content is scrollable */}
                {!fitContent && showScrollFade && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent 0%, #1a1a1b 100%)",
                    }}
                  />
                )}
              </div>
            )}

            {/* Metrics - Reddit Style Compact */}
            <div className="flex items-center gap-3 pt-2 border-t border-[#343536]">
              {/* Upvotes */}
              <button className="flex items-center gap-1 text-[#818384] hover:text-[#8b5cf6] transition-colors group">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
                <span className="text-xs font-medium">{post.score}</span>
              </button>

              {/* Comments */}
              <button className="flex items-center gap-1 text-[#818384] hover:text-[#8b5cf6] transition-colors group">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
                <span className="text-xs font-medium">{post.reply_count}</span>
              </button>

              {/* Action buttons - Queue and Ignore */}
              {brandId && post.prospect_id && (
                <>
                  {/* Queue/Check button */}
                  <button
                    onClick={handleQueue}
                    disabled={postActionMutation.isPending}
                    className="flex items-center gap-1 text-[#818384] hover:text-green-500 transition-colors group disabled:opacity-50"
                    title="Queue for response"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">Queue</span>
                  </button>

                  {/* Ignore/X button */}
                  <button
                    onClick={handleIgnore}
                    disabled={postActionMutation.isPending}
                    className="flex items-center gap-1 text-[#818384] hover:text-red-500 transition-colors group disabled:opacity-50"
                    title="Ignore this post"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">Ignore</span>
                  </button>
                </>
              )}

              {/* Share */}
              <button className="flex items-center gap-1 text-[#818384] hover:text-[#8b5cf6] transition-colors group ml-auto">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                  />
                </svg>
                <span className="text-xs font-medium">Share</span>
              </button>
            </div>

            {/* Suggested Reply (if exists) - Reddit style with Plum accent */}
            {post.suggested_agent_reply && (
              <div className="mt-3 p-3 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-[#8b5cf6]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs font-medium text-[#8b5cf6]">
                    AI Suggested Reply
                  </span>
                </div>
                <p className="text-[#d7dadc] text-xs leading-relaxed line-clamp-3">
                  {post.suggested_agent_reply}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
