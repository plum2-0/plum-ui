"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Clock,
  Star,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { LiquidBadge } from "@/components/ui/LiquidBadge";
import { Popover } from "@/components/ui/Popover";
import { RedditConvo } from "./RedditConvo";
import type { ProspectProfile } from "@/hooks/api/useProspectProfilesQuery";
import type { Agent } from "@/types/agent";

interface ProspectProfileDetailProps {
  profile: ProspectProfile;
  onClose?: () => void;
  agents: Agent[];
  isLoadingAgents: boolean;
  setSelectedProfile: (profile: ProspectProfile) => void;
  isLoadingProfile: boolean;
}

export function ProspectProfileDetail({
  profile,
  onClose,
  isLoadingProfile,
}: ProspectProfileDetailProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showAllSubreddits, setShowAllSubreddits] = useState(false);

  // Use detailed profile if available, otherwise fall back to basic profile
  const currentProfile = profile;

  // Get the active conversation
  const activeConversation = currentProfile.active_convos?.[0];

  // (removed unused mock engagement analytics)

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

  // Show loading state if prospect_status is LOADING
  if (currentProfile.prospect_status === "LOADING") {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-black/60 via-purple-900/5 to-black/40">
        <GlassCard blur="ultra" className="m-4 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="w-16 h-16 mx-auto"
              >
                <RefreshCw className="w-16 h-16 text-purple-400" />
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  Loading Profile Data
                </h3>
                <p className="text-white/60 text-sm">
                  We're fetching the latest information for {currentProfile.name}
                </p>
                <p className="text-white/40 text-xs mt-4">
                  Please refresh this page in 60 seconds to check back
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

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
                  <a
                    href={`https://www.reddit.com/user/${currentProfile.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-purple-400 transition-colors group"
                  >
                    {currentProfile.name}
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
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

                {currentProfile?.inferred_attributes && (
                  <div className="flex gap-4 mb-2">
                    {currentProfile.inferred_attributes
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
                          <Popover
                            trigger={
                              <HelpCircle className="w-3 h-3 text-white/30 cursor-help" />
                            }
                            side="bottom"
                            align="start"
                          >
                            <div className="font-semibold mb-1 text-purple-300">
                              Confidence:{" "}
                              <span
                                className={cn(
                                  "capitalize",
                                  attr.confidence === "high" &&
                                    "text-green-400",
                                  attr.confidence === "medium" &&
                                    "text-yellow-400",
                                  attr.confidence === "low" && "text-orange-400"
                                )}
                              >
                                {attr.confidence}
                              </span>
                            </div>
                            {attr.llm_explanation && (
                              <div className="text-white/90 leading-relaxed">
                                {attr.llm_explanation}
                              </div>
                            )}
                          </Popover>
                        </div>
                      ))}
                  </div>
                )}

                {/* Account Stats - Karma and Age */}
                {currentProfile?.account_stats && (
                  <div className="flex gap-3 mt-1 text-xs text-white/40">
                    <span>
                      {currentProfile.account_stats.total_karma.toLocaleString()}{" "}
                      karma
                    </span>
                    <span>•</span>
                    <span>
                      {currentProfile.account_stats.account_age_days} days old
                    </span>
                    <span>•</span>
                    <span>
                      {currentProfile.account_stats.link_karma.toLocaleString()}{" "}
                      post /{" "}
                      {currentProfile.account_stats.comment_karma.toLocaleString()}{" "}
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
          {currentProfile?.subreddit_affinities?.top_by_volume &&
            currentProfile.subreddit_affinities.top_by_volume.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-white/60 uppercase tracking-wider mr-2">
                    Active Communities:
                  </span>
                  {currentProfile.subreddit_affinities.top_by_volume
                    .slice(0, showAllSubreddits ? undefined : 3)
                    .map((subreddit, index) => (
                      <motion.div
                        key={subreddit.subreddit}
                        initial={index >= 3 ? { opacity: 0, scale: 0.8 } : {}}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: index >= 3 ? (index - 3) * 0.05 : 0,
                          duration: 0.3,
                          ease: "easeOut",
                        }}
                      >
                        <div
                          onClick={() =>
                            window.open(
                              `https://www.reddit.com/r/${subreddit.subreddit}`,
                              "_blank"
                            )
                          }
                        >
                          <LiquidBadge
                            variant="default"
                            size="sm"
                            className="text-xs cursor-pointer hover:scale-105 transition-transform"
                          >
                            r/{subreddit.subreddit} ({subreddit.count})
                          </LiquidBadge>
                        </div>
                      </motion.div>
                    ))}
                  {currentProfile.subreddit_affinities.top_by_volume.length >
                    3 &&
                    !showAllSubreddits && (
                      <motion.button
                        onClick={() => setShowAllSubreddits(true)}
                        className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>
                          +
                          {currentProfile.subreddit_affinities.top_by_volume
                            .length - 3}{" "}
                          more
                        </span>
                        <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
                      </motion.button>
                    )}
                  {showAllSubreddits &&
                    currentProfile.subreddit_affinities.top_by_volume.length >
                      3 && (
                      <motion.button
                        onClick={() => setShowAllSubreddits(false)}
                        className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>Show less</span>
                        <ChevronUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
                      </motion.button>
                    )}
                </div>
              </div>
            )}

          {/* Topics */}
          {currentProfile?.content_signals?.topics &&
            currentProfile.content_signals.topics.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-white/60 uppercase tracking-wider mr-2">
                  Interested In:
                </span>
                {currentProfile.content_signals.topics.map((topic) => (
                  <LiquidBadge
                    key={topic}
                    variant="purple"
                    size="sm"
                    className="text-xs"
                  >
                    {topic
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </LiquidBadge>
                ))}
              </div>
            )}

          {/* Visual Separator */}
          <div className="border-t border-white/10"></div>

          {/* Best Reply Windows */}
          {currentProfile?.best_reply_windows &&
            currentProfile.best_reply_windows.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60 uppercase tracking-wider mr-2">
                  High Activity At:
                </span>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-3 h-3 text-white/40" />
                  {currentProfile.best_reply_windows
                    .slice(0, 1)
                    .map((window, index) => (
                      <span key={index} className="text-white/80">
                        <span className="font-medium">{window.weekday}s</span>{" "}
                        {window.start_hour_utc}:00-{window.end_hour_utc}:00 UTC
                        {index === 0 && (
                          <span className="text-green-400/80 ml-2 text-xs">
                            (best time)
                          </span>
                        )}
                      </span>
                    ))}
                </div>
              </div>
            )}
        </div>
      </GlassCard>

      {/* Conversation Thread */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto px-4 pb-4">
        {activeConversation ? (
          <RedditConvo
            conversation={activeConversation}
            isLoading={isLoadingProfile}
          />
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
