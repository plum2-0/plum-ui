"use client";

import React from "react";
import { motion } from "framer-motion";
import RedditPostListItem from "@/components/dashboard2/RedditPostListItem";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Conversation } from "@/hooks/api/useProspectProfilesQuery";

interface RedditConvoProps {
  conversation: Conversation;
  brandId: string;
  prospectId: string;
  prospectProfileId: string;
  isLoading?: boolean;
}

export function RedditConvo({
  conversation,
  brandId,
  prospectId,
  prospectProfileId,
  isLoading,
}: RedditConvoProps) {
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

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <GlassCard blur="ultra" className="p-6 text-center">
          <p className="text-white/60">No conversation history yet</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="border-2 border-purple-500/40 rounded-lg p-4 bg-black/20 backdrop-blur-sm">
      <div className="space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.thing_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <RedditPostListItem
              post={post}
              brandId={brandId}
              prospectId={prospectId}
              prospectProfileId={prospectProfileId}
              activeConvoId={conversation.id || ""}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
