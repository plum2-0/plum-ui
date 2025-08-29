"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CommentTreeContainer } from "./CommentTree";
import type { Conversation } from "@/hooks/api/useProspectProfilesQuery";
import type { RedditPost } from "@/types/brand";

interface RedditConvoProps {
  conversation: Conversation;
  isLoading?: boolean;
  onIgnore?: (post: RedditPost) => Promise<void>;
}

export function RedditConvo({ conversation, isLoading, onIgnore }: RedditConvoProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <GlassCard blur="ultra" className="p-6 text-center">
          <p className="text-white/60">Loading conversation...</p>
        </GlassCard>
      </div>
    );
  }

  const posts = conversation.reddit_conversations || [];
  const commentTree = (conversation as any).comment_tree || null;
  
  // Get the parent post (last item in reddit_conversations)
  const parentPost = posts.length > 0 ? posts[posts.length - 1] : null;

  if (!commentTree && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <GlassCard blur="ultra" className="p-6 text-center">
          <p className="text-white/60">No conversation history yet</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="border-2 border-purple-500/40 rounded-lg bg-black/20 backdrop-blur-sm">
      <div className="m-4">
        <CommentTreeContainer 
          tree={commentTree} 
          parentPost={parentPost} 
          isLoading={false} 
          onIgnore={onIgnore}
        />
      </div>
    </div>
  );
}
