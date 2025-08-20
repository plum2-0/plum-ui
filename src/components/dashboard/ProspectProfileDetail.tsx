"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { X, Clock, Star, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { LiquidBadge } from "@/components/ui/LiquidBadge";
import RedditPostListItem from "@/components/dashboard2/RedditPostListItem";
import type { ProspectProfile } from "@/hooks/api/useProspectProfilesQuery";
import { useProspectProfileDetailQuery } from "@/hooks/api/useProspectProfileDetailQuery";
import type { Agent } from "@/types/agent";

interface ProspectProfileDetailProps {
  profile: ProspectProfile;
  onClose?: () => void;
  agents: Agent[];
  isLoadingAgents: boolean;
}

export function ProspectProfileDetail({
  profile,
  onClose,
}: ProspectProfileDetailProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch detailed profile data with active conversation
  const { data: detailedProfile, isLoading } = useProspectProfileDetailQuery({
    profileId: profile.id,
    enabled: !!profile.id,
  });

  console.log("detailedProfile o o o oo");

  console.log(JSON.stringify(detailedProfile, null, 2));

  // Use detailed profile if available, otherwise fall back to basic profile
  const currentProfile = detailedProfile || profile;

  // Get all posts from the conversation
  const posts = currentProfile.active_convo?.reddit_conversations || [];

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Mock engagement analytics (would come from real data in production)
  const engagementData = {
    score: currentProfile.engagementScore || 75,
    responseTime: "~2 hours",
    interestedUseCase:
      currentProfile.interestedUseCase || "Team Collaboration Tools",
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400 bg-green-400/10";
      case "negative":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-yellow-400 bg-yellow-400/10";
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-black/60 via-purple-900/5 to-black/40">
      {/* Header Section */}
      <GlassCard blur="ultra" className="m-4 p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-6">
            {/* Profile Information */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                  {currentProfile.profile_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentProfile.profile_image}
                      alt={currentProfile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    currentProfile.name.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
                  {currentProfile.name}
                  {currentProfile.sentiment && (
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        getSentimentColor(currentProfile.sentiment)
                      )}
                    >
                      {currentProfile.sentiment}
                    </span>
                  )}
                </h2>

                {detailedProfile?.inferred_attributes && (
                  <div className="flex gap-4 mb-2">
                    {detailedProfile.inferred_attributes
                      .filter(
                        (attr) =>
                          attr.attribute_key === "age_bracket" ||
                          attr.attribute_key === "country"
                      )
                      .map((attr) => (
                        <div
                          key={attr.attribute_key}
                          className="flex items-center gap-1"
                        >
                          <span className="text-sm text-white/80 font-semibold">
                            {attr.attribute_key === "age_bracket"
                              ? "Age: "
                              : "Location: "}
                            {attr.attribute_value}
                          </span>
                          <div className="relative group">
                            <HelpCircle className="w-3 h-3 text-white/30 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                              <div className="bg-black/90 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                Confidence: {attr.confidence}
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-4 border-transparent border-t-black/90"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Account Stats - Karma and Age */}
                {detailedProfile?.account_stats && (
                  <div className="flex gap-3 mt-1 text-xs text-white/40">
                    <span>
                      {detailedProfile.account_stats.total_karma.toLocaleString()}{" "}
                      karma
                    </span>
                    <span>•</span>
                    <span>
                      {detailedProfile.account_stats.account_age_days} days old
                    </span>
                    <span>•</span>
                    <span>
                      {detailedProfile.account_stats.link_karma.toLocaleString()}{" "}
                      post /{" "}
                      {detailedProfile.account_stats.comment_karma.toLocaleString()}{" "}
                      comment
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <LiquidButton variant="ghost" size="icon" onClick={() => {}}>
              <Star className="w-4 h-4" />
            </LiquidButton>
            {onClose && (
              <LiquidButton variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </LiquidButton>
            )}
          </div>
        </div>

        {/* Profile Tags and Interests */}
        <div className="mt-6 space-y-4">
          {/* Active Communities */}
          {detailedProfile?.subreddit_affinities?.top_by_volume &&
            detailedProfile.subreddit_affinities.top_by_volume.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-white/60 uppercase tracking-wider mr-2">
                  Active Communities:
                </span>
                {detailedProfile.subreddit_affinities.top_by_volume
                  .slice(0, 3)
                  .map((subreddit) => (
                    <LiquidBadge
                      key={subreddit.subreddit}
                      variant="default"
                      size="sm"
                      className="text-xs"
                    >
                      r/{subreddit.subreddit} ({subreddit.count})
                    </LiquidBadge>
                  ))}
                {detailedProfile.subreddit_affinities.top_by_volume.length >
                  3 && (
                  <span className="text-xs text-white/40">
                    +
                    {detailedProfile.subreddit_affinities.top_by_volume.length -
                      3}{" "}
                    more
                  </span>
                )}
              </div>
            )}

          {/* Interested In */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-white/60 uppercase tracking-wider mr-2">
              Interested In:
            </span>
            <LiquidBadge variant="purple" size="md">
              {engagementData.interestedUseCase}
            </LiquidBadge>
          </div>

          {/* Visual Separator */}
          <div className="border-t border-white/10"></div>

          {/* Best Reply Windows */}
          {detailedProfile?.best_reply_windows && detailedProfile.best_reply_windows.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60 uppercase tracking-wider mr-2">
                High Activity At:
              </span>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-3 h-3 text-white/40" />
                {detailedProfile.best_reply_windows.slice(0, 1).map((window, index) => (
                  <span key={index} className="text-white/80">
                    <span className="font-medium">{window.weekday}s</span> {window.start_hour_utc}:00-{window.end_hour_utc}:00 UTC
                    {index === 0 && (
                      <span className="text-green-400/80 ml-2 text-xs">(best time)</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Conversation Thread */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto px-4 pb-4 space-y-4"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <GlassCard blur="ultra" className="p-6 text-center">
              <p className="text-white/60">Loading conversation...</p>
            </GlassCard>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post, index) => (
            <motion.div
              key={post.thing_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <RedditPostListItem
                post={post}
                brandId={currentProfile.id}
                prospectId={currentProfile.id || ""}
              />
            </motion.div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <GlassCard blur="ultra" className="p-6 text-center">
              <p className="text-white/60">No conversation history yet</p>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
