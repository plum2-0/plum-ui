"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Share,
  Bookmark,
  MoreHorizontal,
  Award,
  Minus,
  Plus,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react";
import { InlineReplyBox } from "./InlineReplyBox";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { useProspectProfiles } from "@/contexts/ProspectProfilesContext";
import { useProfile } from "@/contexts/ProfileContext";

interface CommentNode {
  id: string;
  thing_id: string;
  author: string;
  body: string;
  created_utc: number;
  score: number;
  permalink: string;
  parent_id: string;
  depth: number;
  children: CommentNode[];
}

interface CommentTreeProps {
  node: CommentNode;
  level?: number;
  isLast?: boolean;
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min. ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr. ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
  return `${Math.floor(diff / 2592000)} months ago`;
}

function countAllComments(node: CommentNode): number {
  let count = 1; // Count the current node
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      count += countAllComments(child);
    }
  }
  return count;
}

export function CommentTree({
  node,
  level = 0,
  isLast = false,
}: CommentTreeProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [upvoted, setUpvoted] = React.useState(false);
  const [downvoted, setDownvoted] = React.useState(false);
  const { currentProfileId, isReplyBoxOpen, openReplyBox, closeReplyBox } = useProspectProfiles();
  const { prospectProfileId } = useProfile();
  const hasChildren = node.children && node.children.length > 0;
  
  const profileId = prospectProfileId || currentProfileId || "";
  const postId = node.thing_id || node.id;
  const showReplyBox = isReplyBoxOpen(profileId, postId);

  const currentScore = node.score + (upvoted ? 1 : 0) - (downvoted ? 1 : 0);

  const handleUpvote = () => {
    if (upvoted) {
      setUpvoted(false);
    } else {
      setUpvoted(true);
      setDownvoted(false);
    }
  };

  const handleDownvote = () => {
    if (downvoted) {
      setDownvoted(false);
    } else {
      setDownvoted(true);
      setUpvoted(false);
    }
  };

  return (
    <div className={`relative ${level > 0 ? "ml-2" : ""}`}>
      {/* Reddit-style thread line */}
      {level > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px] hover:bg-zinc-600 bg-zinc-700 cursor-pointer transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ left: "-9px" }}
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <div className="flex">
          {/* Collapse button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mr-2 mt-1 text-zinc-500 hover:bg-zinc-800 rounded p-0.5 transition-colors"
          >
            {isExpanded ? (
              <Minus className="w-3 h-3" />
            ) : (
              <Plus className="w-3 h-3" />
            )}
          </button>

          <div className="flex-1">
            {/* Comment Header */}
            <div className="flex items-center gap-1 text-xs mb-1">
              <span className="font-medium text-blue-400 hover:underline cursor-pointer">
                {node.author || "[deleted]"}
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400">
                {currentScore} point{currentScore !== 1 ? "s" : ""}
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-500">
                {formatTimeAgo(node.created_utc)}
              </span>
            </div>

            {/* Comment Body */}
            {isExpanded && (
              <>
                <div className="text-sm text-zinc-200 mb-2 leading-[1.5] break-words">
                  {node.body}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={handleUpvote}
                    className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
                      upvoted ? "text-orange-500" : "text-zinc-500"
                    }`}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleDownvote}
                    className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
                      downvoted ? "text-blue-500" : "text-zinc-500"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showReplyBox ? (
                    <button
                      onClick={() => closeReplyBox(profileId, postId)}
                      className="px-2 py-1 rounded hover:bg-zinc-800 font-medium transition-colors flex items-center gap-1 bg-zinc-800 text-zinc-400"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  ) : (
                    <LiquidButton
                      onClick={() => openReplyBox(profileId, postId)}
                      variant="primary"
                      size="sm"
                      shimmer={true}
                      className="inline-flex items-center gap-1.5 min-w-[120px] justify-center"
                    >
                      <Sparkles className="w-3 h-3 flex-shrink-0" />
                      <span className="whitespace-nowrap">Generate Reply</span>
                    </LiquidButton>
                  )}

                  {/* Comment count badge */}
                  {!showReplyBox &&
                    node.children &&
                    node.children.length > 0 && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800/50 rounded-full border border-zinc-700/50">
                        <MessageCircle className="w-3 h-3 text-zinc-500" />
                        <span className="text-xs text-zinc-400 font-medium">
                          {node.children.length}
                        </span>
                      </div>
                    )}

                  <button className="p-1 rounded hover:bg-zinc-800 text-zinc-500 transition-colors">
                    <Award className="w-4 h-4" />
                  </button>

                  <button className="p-1 rounded hover:bg-zinc-800 text-zinc-500 transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button className="p-1 rounded hover:bg-zinc-800 text-zinc-500 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  <a
                    href={`https://reddit.com${node.permalink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-zinc-500 hover:underline"
                  >
                    permalink
                  </a>
                </div>

                {/* Inline Reply Box */}
                {showReplyBox && (
                  <InlineReplyBox
                    parentPost={node}
                    onClose={() => closeReplyBox(profileId, postId)}
                    onSuccess={() => {
                      closeReplyBox(profileId, postId);
                      // Optionally refresh the tree here
                    }}
                  />
                )}
              </>
            )}

            {/* Collapsed indicator */}
            {!isExpanded && hasChildren && (
              <div className="text-xs text-zinc-500 mt-1">
                ({node.children.length} child
                {node.children.length !== 1 ? "ren" : ""})
              </div>
            )}
          </div>
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="mt-3 ml-5">
            {node.children.map((child, index) => (
              <CommentTree
                key={child.id}
                node={child}
                level={level + 1}
                isLast={index === node.children.length - 1}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

interface CommentTreeContainerProps {
  tree: CommentNode | null;
  parentPost?: any;
  isLoading?: boolean;
  onIgnore?: (post: any) => Promise<void>;
}

function ParentPost({ post }: { post: any }) {
  const [upvoted, setUpvoted] = React.useState(false);
  const [downvoted, setDownvoted] = React.useState(false);
  const { currentProfileId, isReplyBoxOpen, openReplyBox, closeReplyBox } = useProspectProfiles();
  const { prospectProfileId } = useProfile();
  
  const profileId = prospectProfileId || currentProfileId || "";
  const postId = post?.thing_id || post?.id || "";
  const showReplyBox = isReplyBoxOpen(profileId, postId);
  
  const currentScore =
    (post?.score || 0) + (upvoted ? 1 : 0) - (downvoted ? 1 : 0);

  const handleUpvote = () => {
    if (upvoted) {
      setUpvoted(false);
    } else {
      setUpvoted(true);
      setDownvoted(false);
    }
  };

  const handleDownvote = () => {
    if (downvoted) {
      setDownvoted(false);
    } else {
      setDownvoted(true);
      setUpvoted(false);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min. ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr. ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (!post) return null;

  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 mb-4">
      <div className="p-4">
        {/* Post Header */}
        <div className="flex items-start gap-3">
          {/* Vote buttons */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleUpvote}
              className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
                upvoted ? "text-orange-500" : "text-zinc-500"
              }`}
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            <span
              className={`text-sm font-medium ${
                upvoted
                  ? "text-orange-500"
                  : downvoted
                  ? "text-blue-500"
                  : "text-zinc-400"
              }`}
            >
              {currentScore}
            </span>

            <button
              onClick={handleDownvote}
              className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
                downvoted ? "text-blue-500" : "text-zinc-500"
              }`}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Post Content */}
          <div className="flex-1">
            {/* Metadata */}
            <div className="flex items-center gap-1 text-xs text-zinc-500 mb-2">
              <span>Posted by</span>
              <span className="text-blue-400 hover:underline cursor-pointer">
                u/{post.author || "[deleted]"}
              </span>
              <span>•</span>
              <span>
                {formatTimeAgo(post.created_utc || Date.now() / 1000)}
              </span>
              {post.subreddit && (
                <>
                  <span>•</span>
                  <span className="text-zinc-400">r/{post.subreddit}</span>
                </>
              )}
            </div>

            {/* Title */}
            {post.title && (
              <h2 className="text-lg font-medium text-zinc-100 mb-2">
                {post.title}
              </h2>
            )}

            {/* Body */}
            <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {post.content || post.body || ""}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3 text-xs">
              {showReplyBox ? (
                <button
                  onClick={() => closeReplyBox(profileId, postId)}
                  className="px-3 py-1.5 rounded-lg hover:bg-zinc-800 font-medium transition-colors flex items-center gap-1 bg-zinc-800 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              ) : (
                <LiquidButton
                  onClick={() => openReplyBox(profileId, postId)}
                  variant="primary"
                  size="sm"
                  shimmer={true}
                  className="inline-flex items-center gap-1.5 min-w-[130px] justify-center"
                >
                  <span className="whitespace-nowrap">Generate Reply</span>
                </LiquidButton>
              )}

              {/* Comment count header badge */}
              {!showReplyBox &&
                post.reply_count !== undefined &&
                post.reply_count > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800/50 rounded-full border border-zinc-700/50">
                    <MessageCircle className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm text-zinc-400 font-medium">
                      {post.reply_count}{" "}
                      {post.reply_count === 1 ? "comment" : "comments"}
                    </span>
                  </div>
                )}

              {post.permalink && (
                <a
                  href={`https://reddit.com${post.permalink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-zinc-500 hover:underline"
                >
                  View on Reddit
                </a>
              )}
            </div>

            {/* Inline Reply Box for Parent Post */}
            {showReplyBox && (
              <InlineReplyBox
                parentPost={post}
                onClose={() => closeReplyBox(profileId, postId)}
                onSuccess={() => {
                  closeReplyBox(profileId, postId);
                  // Optionally refresh the tree here
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommentTreeContainer({
  tree,
  parentPost,
  isLoading,
  onIgnore,
}: CommentTreeContainerProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-zinc-900 rounded-lg">
        <div className="text-zinc-400">Loading conversation tree...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Always show parent post if available, even without tree */}
      {parentPost && <ParentPost post={parentPost} />}

      {/* Comment thread */}
      {tree ? (
        <div className="bg-zinc-900 rounded-lg border border-zinc-800">
          {/* Enhanced comment thread header */}
          <div className="p-4 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Comment count badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30">
                  <MessageCircle className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-300">
                    {countAllComments(tree)}{" "}
                    {countAllComments(tree) === 1 ? "Comment" : "Comments"}
                  </span>
                </div>
                <span className="text-zinc-600">•</span>
                <a href="#" className="text-blue-400 hover:underline text-sm">
                  View on Reddit
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <select className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-zinc-600 hover:bg-zinc-800 transition-colors">
                  <option>Sort by: best</option>
                  <option>Sort by: top</option>
                  <option>Sort by: new</option>
                  <option>Sort by: controversial</option>
                  <option>Sort by: old</option>
                  <option>Sort by: Q&A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Comments section */}
          <div className="p-4">
            <CommentTree node={tree} />
          </div>
        </div>
      ) : parentPost ? (
        // If we have a parent post but no tree, show a message encouraging engagement
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8 text-center">
          <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 mb-2">No replies yet</p>
        </div>
      ) : (
        // No parent post and no tree
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8 text-center">
          <p className="text-zinc-400">No conversation data available</p>
        </div>
      )}
    </div>
  );
}
