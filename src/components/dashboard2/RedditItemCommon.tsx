"use client";

import Image from "next/image";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

// Helper function to format time ago
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Markdown renderers for Reddit-like dark theme
export const markdownComponents: Components = {
  a: (props) => (
    <a 
      {...props} 
      className="text-blue-400 hover:underline break-all" 
      style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
    />
  ),
  p: (props) => <p {...props} className="mb-2 break-words" />,
  ul: (props) => <ul {...props} className="list-disc pl-6 mb-2" />,
  ol: (props) => <ol {...props} className="list-decimal pl-6 mb-2" />,
  li: (props) => <li {...props} className="mb-1 break-words" />,
  blockquote: (props) => (
    <blockquote
      {...props}
      className="border-l-4 border-white/20 pl-3 text-white/70 italic break-words"
    />
  ),
  code: (props: any) => {
    const { inline, children, ...rest } = props;
    if (inline) {
      return (
        <code
          {...rest}
          className="bg-[#272729] text-white/90 px-1.5 py-0.5 rounded break-all"
          style={{ wordBreak: "break-word" }}
        >
          {children}
        </code>
      );
    }
    // Use span with display:block to avoid p > div nesting issue
    return (
      <span className="block bg-[#272729] text-white/90 p-3 rounded-md overflow-x-auto mb-3 max-w-full">
        <code {...rest} className="block whitespace-pre-wrap break-words font-mono text-sm">
          {children}
        </code>
      </span>
    );
  },
  h1: (props) => <h1 {...props} className="text-xl font-semibold mb-2 break-words" />,
  h2: (props) => <h2 {...props} className="text-lg font-semibold mb-2 break-words" />,
  h3: (props) => <h3 {...props} className="text-base font-semibold mb-2 break-words" />,
};

interface RedditPostHeaderProps {
  subreddit: string;
  author: string;
  createdAt: string;
  mentionedBrand?: string | null;
}

export function RedditPostHeader({
  subreddit,
  author,
  createdAt,
  mentionedBrand,
}: RedditPostHeaderProps) {
  return (
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
        in r/{subreddit}
      </span>
      <span className="text-white/40">•</span>
      <span className="font-body">
        {formatTimeAgo(createdAt)} by {author}
      </span>
    </div>
  );
}

interface RedditPostTitleProps {
  title: string;
  link: string;
}

export function RedditPostTitle({ title, link }: RedditPostTitleProps) {
  return (
    <h3
      className="text-white font-heading text-xl md:text-2xl font-semibold leading-tight mb-3 hover:text-white/90 transition-colors cursor-pointer"
      onClick={() => window.open(link, "_blank", "noopener,noreferrer")}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.open(link, "_blank", "noopener,noreferrer");
        }
      }}
      tabIndex={0}
      role="link"
      title="Open Reddit post in new tab"
    >
      {title}
    </h3>
  );
}

interface RedditPostContentProps {
  content: string;
}

export function RedditPostContent({ content }: RedditPostContentProps) {
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const shouldShowExpandButton = content.length > 200;

  return (
    <div className="mb-4" onClick={(e) => e.stopPropagation()}>
      <div className="relative">
        {false && shouldShowExpandButton && <div />}
        <div
          className="font-body text-[15px] md:text-[16px] leading-relaxed overflow-hidden"
          style={{
            color: "#d7dadc",
            maxHeight: isContentExpanded ? "none" : 240,
            paddingTop: shouldShowExpandButton ? 8 : 0,
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={markdownComponents}
          >
            {content}
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
  );
}

interface RedditStatBadgesProps {
  upvotes: number;
  comments: number;
}

export function RedditStatBadges({ upvotes, comments }: RedditStatBadgesProps) {
  return (
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
        <span className="font-medium">{upvotes}</span>
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
        <span className="font-medium">{comments}</span>
      </span>
    </div>
  );
}