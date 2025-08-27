"use client";

import { RedditPost } from "@/types/brand";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import Link from "next/link";
import Image from "next/image";
import { GlassCard } from "@/components/ui/GlassCard";
import { LiquidBadge } from "@/components/ui/LiquidBadge";
import { AttractiveText } from "@/components/ui/AttractiveText";
import { FloatingOrbGroup } from "@/components/ui/FloatingOrb";
import { glassStyles } from "@/lib/styles/glassMorphism";


interface ProspectCardProps {
  post: RedditPost;
  className?: string;
  onReply?: () => void;
}

export default function ProspectCard({
  post,
  className = "",
}: ProspectCardProps) {
  const [showScrollFade, setShowScrollFade] = useState(true);
  const [contentRef, setContentRef] = useState<HTMLDivElement | null>(null);

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
      // Use span with display:block to avoid p > div nesting issue
      return (
        <span className="block bg-[#272729] text-white/90 p-3 rounded-md overflow-auto mb-3">
          <code {...rest} className="block whitespace-pre-wrap font-mono text-sm">
            {children}
          </code>
        </span>
      );
    },
    h1: (props) => <h1 {...props} className="text-xl font-semibold mb-2" />,
    h2: (props) => <h2 {...props} className="text-lg font-semibold mb-2" />,
    h3: (props) => <h3 {...props} className="text-base font-semibold mb-2" />,
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

              {/* Content - Scrollable, fills available space */}
              {post.content && (
                <div className="flex-1 mb-4 relative">
                  <div
                    ref={setContentRef}
                    className="overflow-y-auto text-white/80 font-body text-sm leading-relaxed rounded-lg h-full"
                    style={{
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

              {/* Reply box removed - content fills this space now */}

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
