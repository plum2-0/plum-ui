"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getBrandIdFromCookie } from "@/lib/cookies";
import { GlassCard } from "@/components/ui/GlassCard";

import { LiquidBadge } from "@/components/ui/LiquidBadge";
import { Popover } from "@/components/ui/Popover";
import { PopoverWithPortal } from "@/components/ui/PopoverWithPortal";
import { RedditConvo } from "./RedditConvo";
import type { ProspectProfile } from "@/hooks/api/useProspectProfilesQuery";
import type { Agent } from "@/types/agent";
import { useBrand } from "@/contexts/BrandContext";

// ============================================================================
// Constants & Utilities
// ============================================================================

const SENTIMENT_COLORS = {
  positive: "text-green-400 bg-green-400/10",
  negative: "text-red-400 bg-red-400/10",
  neutral: "text-yellow-400 bg-yellow-400/10",
} as const;

const CONFIDENCE_COLORS = {
  high: "text-green-400",
  medium: "text-yellow-400",
  low: "text-orange-400",
} as const;

const getSentimentColor = (sentiment?: string): string => {
  return SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS] || SENTIMENT_COLORS.neutral;
};

const getConfidenceColor = (confidence?: string): string => {
  return CONFIDENCE_COLORS[confidence as keyof typeof CONFIDENCE_COLORS] || "";
};

const formatTopic = (topic: string): string => {
  return topic
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// ============================================================================
// Sub-Components
// ============================================================================

interface ProfileLoadingStateProps {
  profileName: string;
}

const ProfileLoadingState: React.FC<ProfileLoadingStateProps> = ({ profileName }) => (
  <div className="h-full flex flex-col bg-gradient-to-br from-black/60 via-purple-900/5 to-black/40">
    <GlassCard blur="ultra" className="m-4 p-6">
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-16 h-16 mx-auto"
          >
            <RefreshCw className="w-16 h-16 text-purple-400" />
          </motion.div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Loading Profile Data</h3>
            <p className="text-white/60 text-sm">
              We're fetching the latest information for {profileName}
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

interface ProfileAvatarProps {
  name: string;
  imageUrl?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ name, imageUrl }) => (
  <div className="relative">
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  </div>
);

interface ProfileHeaderProps {
  name: string;
  sentiment?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, sentiment }) => (
  <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
    <a
      href={`https://www.reddit.com/user/${name}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 hover:text-purple-400 transition-colors group"
    >
      {name}
      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
    {sentiment && (
      <span className={cn("px-2 py-1 rounded-full text-xs", getSentimentColor(sentiment))}>
        {sentiment}
      </span>
    )}
  </h2>
);

interface AttributeData {
  attribute_key: string;
  attribute_value: string;
  confidence?: string;
  llm_explanation?: string;
}

interface ProfileAttributesProps {
  attributes?: AttributeData[];
}

const ProfileAttributes: React.FC<ProfileAttributesProps> = ({ attributes }) => {
  if (!attributes) return null;

  const relevantAttributes = attributes.filter(
    (attr) => attr.attribute_key === "age_bracket" || attr.attribute_key === "country"
  );

  if (relevantAttributes.length === 0) return null;

  return (
    <div className="flex gap-4 mb-2">
      {relevantAttributes.map((attr) => (
        <div key={attr.attribute_key} className="flex items-center gap-1">
          <span className="text-sm text-white/80 font-semibold">
            {attr.attribute_key === "age_bracket" ? "Age: " : "Location: "}
            {attr.attribute_value}
          </span>
          <Popover
            trigger={<HelpCircle className="w-3 h-3 text-white/30 cursor-help" />}
            side="bottom"
            align="start"
          >
            <div className="font-semibold mb-1 text-purple-300">
              Confidence:{" "}
              <span className={cn("capitalize", getConfidenceColor(attr.confidence))}>
                {attr.confidence}
              </span>
            </div>
            {attr.llm_explanation && (
              <div className="text-white/90 leading-relaxed">{attr.llm_explanation}</div>
            )}
          </Popover>
        </div>
      ))}
    </div>
  );
};

interface AccountStats {
  total_karma: number;
  account_age_days: number;
  link_karma: number;
  comment_karma: number;
}

interface ProfileStatsProps {
  stats?: AccountStats;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="flex gap-3 mt-1 text-xs text-white/40">
      <span>{stats.total_karma.toLocaleString()} karma</span>
      <span>•</span>
      <span>{stats.account_age_days} days old</span>
      <span>•</span>
      <span>
        {stats.link_karma.toLocaleString()} post / {stats.comment_karma.toLocaleString()} comment
      </span>
    </div>
  );
};

interface SubredditAffinity {
  subreddit: string;
  count: number;
}

interface ActiveCommunitiesProps {
  subreddits?: SubredditAffinity[];
}

const ActiveCommunities: React.FC<ActiveCommunitiesProps> = ({ subreddits }) => {
  const [showAll, setShowAll] = useState(false);

  if (!subreddits || subreddits.length === 0) return null;

  const visibleSubreddits = showAll ? subreddits : subreddits.slice(0, 3);
  const hasMore = subreddits.length > 3;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-white/60 uppercase tracking-wider mr-2">
          Active Communities:
        </span>
        {visibleSubreddits.map((subreddit, index) => (
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
                window.open(`https://www.reddit.com/r/${subreddit.subreddit}`, "_blank")
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
        {hasMore && !showAll && (
          <motion.button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>+{subreddits.length - 3} more</span>
            <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
          </motion.button>
        )}
        {showAll && hasMore && (
          <motion.button
            onClick={() => setShowAll(false)}
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
  );
};

interface ProfileInterestsProps {
  topics?: string[];
}

const ProfileInterests: React.FC<ProfileInterestsProps> = ({ topics }) => {
  if (!topics || topics.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-white/60 uppercase tracking-wider mr-2">Interested In:</span>
      {topics.map((topic) => (
        <LiquidBadge key={topic} variant="purple" size="sm" className="text-xs">
          {formatTopic(topic)}
        </LiquidBadge>
      ))}
    </div>
  );
};

interface ReplyWindow {
  weekday: string;
  start_hour_utc: number;
  end_hour_utc: number;
}

interface BestReplyWindowsProps {
  windows?: ReplyWindow[];
}

const BestReplyWindows: React.FC<BestReplyWindowsProps> = ({ windows }) => {
  if (!windows || windows.length === 0) return null;

  const bestWindow = windows[0];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/60 uppercase tracking-wider mr-2">
        High Activity At:
      </span>
      <div className="flex items-center gap-3 text-sm">
        <Clock className="w-3 h-3 text-white/40" />
        <span className="text-white/80">
          <span className="font-medium">{bestWindow.weekday}s</span> {bestWindow.start_hour_utc}
          :00-{bestWindow.end_hour_utc}:00 UTC
          <span className="text-green-400/80 ml-2 text-xs">(best time)</span>
        </span>
      </div>
    </div>
  );
};


// ============================================================================
// Status Dropdown
// ============================================================================

interface ProfileStatusDropdownProps {
  status?: ProspectProfile["prospect_status"];
  onChange?: (status: "ENGAGED" | "REMOVED" | "CONVERTED") => void;
}

const ProfileStatusDropdown: React.FC<ProfileStatusDropdownProps> = ({ status, onChange }) => {
  const getInitial = (): "ENGAGED" | "REMOVED" | "CONVERTED" => {
    if (status === "REMOVED") return "REMOVED";
    if (status === "CONVERTED") return "CONVERTED";
    return "ENGAGED";
  };

  const [current, setCurrent] = useState<"ENGAGED" | "REMOVED" | "CONVERTED">(getInitial());

  useEffect(() => {
    setCurrent(getInitial());
  }, [status]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <span className="text-xs text-white/60 uppercase tracking-wider">Status</span>
        <PopoverWithPortal
          trigger={<HelpCircle className="w-3 h-3 text-white/30 cursor-help" />}
          side="bottom"
          align="start"
        >
          <div className="text-xs space-y-2 w-[420px] sm:w-[520px] max-w-[85vw]">
            <div><span className="text-purple-400 font-medium">Engaged</span> - Leads you are engaged in converting</div>
            <div><span className="text-green-400 font-medium">Converted</span> - Leads that you converted as Customers</div>
            <div><span className="text-red-400 font-medium">Dropped</span> - Leads that you deem are not worth pursuing anymore</div>
          </div>
        </PopoverWithPortal>
      </div>
      <select
        value={current}
        onChange={(e) => {
          const next = e.target.value as "ENGAGED" | "REMOVED" | "CONVERTED";
          setCurrent(next);
          onChange?.(next);
        }}
        className={cn(
          "bg-white/5 border text-sm rounded-md px-3 py-1 focus:outline-none focus:ring-2",
          current === "REMOVED" && "border-red-500/40 text-red-300 focus:ring-red-500",
          current === "ENGAGED" && "border-purple-500/40 text-purple-300 focus:ring-purple-500",
          current === "CONVERTED" && "border-green-500/40 text-green-300 focus:ring-green-500"
        )}
      >
        <option value="ENGAGED">Engaged</option>
        <option value="REMOVED">Dropped</option>
        <option value="CONVERTED">Converted</option>
      </select>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

interface ProspectProfileDetailProps {
  profile: ProspectProfile;
  agents: Agent[];
  isLoadingAgents: boolean;
  setSelectedProfile: (profile: ProspectProfile) => void;
  isLoadingProfile: boolean;
}

export function ProspectProfileDetail({
  profile,
  isLoadingProfile,
}: ProspectProfileDetailProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { brand } = useBrand();

  // Show loading state if prospect_status is LOADING
  if (profile.prospect_status === "LOADING") {
    return <ProfileLoadingState profileName={profile.name} />;
  }

  // Get the active conversation
  const activeConversation = profile.active_convos?.[0];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-black/60 via-purple-900/5 to-black/40">
      {/* Header Section */}
      <GlassCard blur="ultra" className="m-4 p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-6">
            {/* Profile Information */}
            <div className="flex items-center gap-4">
              <ProfileAvatar name={profile.name} imageUrl={profile.profile_image} />
              <div>
                <ProfileHeader name={profile.name} sentiment={profile.sentiment} />
                <ProfileAttributes attributes={profile.inferred_attributes} />
                <ProfileStats stats={profile.account_stats} />
              </div>
            </div>
          </div>

          {/* Status Dropdown (replaces action buttons) */}
          <ProfileStatusDropdown
            status={profile.prospect_status}
            onChange={async (next) => {
              try {
                const brandId = getBrandIdFromCookie();
                if (!brandId || !profile.id) return;
                if (next !== "REMOVED" && next !== "CONVERTED") return; // Only backend-accepted statuses
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                await fetch(
                  `${backendUrl}/api/brand/${brandId}/prospect/profiles/${profile.id}/status`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                      "User-Agent": "Plum-UI/1.0",
                    },
                    body: JSON.stringify({
                      status: next,
                      brand_prospect_id: brand?.prospects?.[0]?.id ?? null,
                    }),
                  }
                );
              } catch (e) {
                console.error("Failed to update prospect status", e);
              }
            }}
          />
        </div>

        {/* Profile Tags and Interests */}
        <div className="mt-6 space-y-4">
          <ActiveCommunities subreddits={profile.subreddit_affinities?.top_by_volume} />
          <ProfileInterests topics={profile.content_signals?.topics} />

          {/* Visual Separator */}
          <div className="border-t border-white/10"></div>

          <BestReplyWindows windows={profile.best_reply_windows} />
        </div>
      </GlassCard>

      {/* Conversation Thread */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto px-4 pb-4">
        {activeConversation ? (
          <RedditConvo conversation={activeConversation} isLoading={isLoadingProfile} />
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