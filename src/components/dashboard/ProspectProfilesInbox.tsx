"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";

import {
  useProspectProfilesQuery,
  type ProspectProfile,
} from "@/hooks/api/useProspectProfilesQuery";

import Image from "next/image";
import { motion } from "framer-motion";

import { LiquidBadge } from "@/components/ui/LiquidBadge";

interface ProspectProfilesInboxProps {
  onProfileSelect: (profile: ProspectProfile) => void;
  selectedProfileId?: string;
}

type FilterType = "all" | "unread" | "replied" | "pending" | "suggested";
type SortType = "recent" | "engagement" | "unread";

export function ProspectProfilesInbox({
  onProfileSelect,
  selectedProfileId,
}: ProspectProfilesInboxProps) {
  const { data: profiles, isLoading, error } = useProspectProfilesQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType] = useState<SortType>("recent");

  // Filter and sort profiles
  const filteredProfiles = useMemo(() => {
    if (!profiles) return [];

    let filtered = [...profiles];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (profile) =>
          profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          profile.tags?.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Apply status filter - Note: active_convo not available in list view anymore
    // Will need to be handled differently or removed
    switch (filterType) {
      case "unread":
        filtered = filtered.filter((p) => (p.unreadCount ?? 0) > 0);
        break;
      case "replied":
        filtered = filtered.filter((p) => p.status === "REPLY");
        break;
      case "pending":
        filtered = filtered.filter((p) => p.status === "PENDING");
        break;
      case "suggested":
        filtered = filtered.filter((p) => p.status === "SUGGESTED_REPLY");
        break;
    }

    // Apply sorting
    switch (sortType) {
      case "recent":
        filtered.sort(
          (a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)
        );
        break;
      case "engagement":
        filtered.sort(
          (a, b) => (b.engagementScore ?? 0) - (a.engagementScore ?? 0)
        );
        break;
      case "unread":
        filtered.sort((a, b) => (b.unreadCount ?? 0) - (a.unreadCount ?? 0));
        break;
    }

    return filtered;
  }, [profiles, searchQuery, filterType, sortType]);

  const handleMarkAsRead = (profileId: string) => {
    // TODO: Handle mark as read
  };

  const handleArchive = (profileId: string) => {
    // TODO: Handle archive
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div
          className="p-6 text-center rounded-2xl"
          style={{
            background:
              "linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
            backdropFilter: "blur(20px) saturate(1.2)",
            WebkitBackdropFilter: "blur(20px) saturate(1.2)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <p className="text-red-400">Failed to load prospect profiles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-black/40 via-black/20 to-transparent overflow-hidden">
      {/* Header Section */}
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <div
          className="p-4 rounded-2xl"
          style={{
            background:
              "linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
            backdropFilter: "blur(20px) saturate(1.2)",
            WebkitBackdropFilter: "blur(20px) saturate(1.2)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <h2 className="text-xl font-heading font-bold text-white mb-4">
            Prospect Conversations
          </h2>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search prospects, tags, subreddits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 backdrop-blur-[15px] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {(["all", "unread", "replied", "suggested"] as FilterType[]).map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 transform-gpu whitespace-nowrap",
                    filterType === filter
                      ? "text-purple-300"
                      : "text-white/60 hover:text-white/80"
                  )}
                  style={{
                    background:
                      filterType === filter
                        ? "linear-gradient(145deg, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0.15) 100%)"
                        : "linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
                    border:
                      filterType === filter
                        ? "1px solid rgba(168, 85, 247, 0.3)"
                        : "1px solid rgba(255, 255, 255, 0.12)",
                    boxShadow:
                      filterType === filter
                        ? "0 4px 12px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.08)"
                        : "0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
                    transform:
                      filterType === filter
                        ? "translateY(-1px)"
                        : "translateY(0)",
                  }}
                  onMouseEnter={(e) => {
                    if (filterType !== filter) {
                      e.currentTarget.style.background =
                        "linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 0 rgba(0, 0, 0, 0.08)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filterType !== filter) {
                      e.currentTarget.style.background =
                        "linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)";
                    }
                  }}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Profile List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <GlassCard key={i} blur="light" className="p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-1/3" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                </div>
              </div>
            </GlassCard>
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredProfiles.map((profile, index) => {
              const isSelected = profile.id === selectedProfileId;

              return (
                <ProspectProfileCard
                  key={profile.id}
                  profile={profile}
                  index={index}
                  isSelected={isSelected}
                  onProfileSelect={onProfileSelect}
                  onMarkAsRead={handleMarkAsRead}
                  onArchive={handleArchive}
                />
              );
            })}
          </AnimatePresence>
        )}

        {!isLoading && filteredProfiles.length === 0 && (
          <div
            className="p-8 text-center rounded-2xl"
            style={{
              background:
                "linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
              backdropFilter: "blur(20px) saturate(1.2)",
              WebkitBackdropFilter: "blur(20px) saturate(1.2)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <p className="text-white/60">
              No prospects found matching your criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ProspectProfileCardProps {
  profile: ProspectProfile;
  index: number;
  isSelected: boolean;
  onProfileSelect: (profile: ProspectProfile) => void;
  onMarkAsRead?: (profileId: string) => void;
  onArchive?: (profileId: string) => void;
}

export function ProspectProfileCard({
  profile,
  index,
  isSelected,
  onProfileSelect,
}: ProspectProfileCardProps) {
  // const latestPost = profile.active_convos?.reddit_conversations[0];
  const isPending = profile.status === "PENDING";
  const hasSuggested = profile.status === "SUGGESTED_REPLY";

  const getTimeAgo = (timestamp?: number) => {
    if (!timestamp) return "";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <motion.div
      key={profile.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onProfileSelect(profile)}
    >
      <GlassCard
        blur="light"
        glow={hasSuggested || isPending}
        className={cn(
          "p-4 cursor-pointer transition-all duration-300 relative overflow-hidden group",
          isSelected
            ? "bg-purple-500/15 border-l-4 border-l-green-400"
            : "hover:bg-white/8 hover:translate-x-1",
          (isPending || hasSuggested) && "font-medium"
        )}
      >
        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/5 to-transparent" />
        </div>

        <div className="relative">
          <div className="flex gap-3">
            {/* Avatar Section */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {profile.profile_image ? (
                  <Image
                    src={profile.profile_image}
                    alt={profile.name}
                    width={48}
                    height={48}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold text-white truncate">
                      {profile.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-white/60">
                      {getTimeAgo(profile.lastMessageTime)}
                    </p>
                    {profile.status && (
                      <LiquidBadge
                        variant={
                          profile.status === "REPLY"
                            ? "success"
                            : profile.status === "SUGGESTED_REPLY"
                            ? "warning"
                            : "primary"
                        }
                        size="sm"
                      >
                        {profile.status === "REPLY"
                          ? "Replied"
                          : profile.status === "SUGGESTED_REPLY"
                          ? "Suggested"
                          : "Pending"}
                      </LiquidBadge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message Preview - Simplified without active_convo */}
          {profile.prospect_source_id && (
            <div className="mt-3 p-2 bg-white/3 rounded-md">
              <p className="text-sm text-white/80 line-clamp-2">
                View details to see conversation
              </p>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
