import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export interface ProspectProfile {
  id?: string;
  name: string;
  profile_image?: string;
  prospect_source?: string;
  prospect_source_id?: string;
  active_convos?: Conversation[];
  inferred_attributes?: Array<{
    attribute_key: string;
    attribute_value: string;
    confidence?: string;
  }>;
  account_stats?: {
    total_karma: number;
    account_age_days: number;
    link_karma: number;
    comment_karma: number;
  };
  subreddit_affinities?: {
    top_by_volume: Array<{
      subreddit: string;
      count: number;
    }>;
  };
  best_reply_windows?: Array<{
    weekday: string;
    start_hour_utc: number;
    end_hour_utc: number;
  }>;
  // Mocked fields for enhanced UI
  lastMessageTime?: number;
  unreadCount?: number;
  engagementScore?: number;
  sentiment?: "positive" | "neutral" | "negative";
  tags?: string[];
  interestedUseCase?: string;
  status?: "REPLY" | "PENDING" | "SUGGESTED_REPLY";
}

export interface Conversation {
  id?: string;
  reddit_conversations: RedditPost[];
}

export interface RedditPost {
  thing_id: string;
  title?: string;
  content: string;
  author: string;
  subreddit: string;
  permalink: string;
  created_utc: number;
  score: number;
  upvotes?: number;
  downvotes?: number;
  reply_count?: number;
  status: "IGNORE" | "REPLY" | "PENDING" | "SUGGESTED_REPLY";
  suggested_agent_reply?: string;
  insert_timestamp?: string;
}

export const PROSPECT_PROFILES_QUERY_KEY = ["prospect-profiles"] as const;

// Mock data generator for development

export function useProspectProfilesQuery() {
  const { data: session } = useSession();

  return useQuery<ProspectProfile[]>({
    queryKey: [...PROSPECT_PROFILES_QUERY_KEY, session?.user?.brandId],
    queryFn: async () => {
      const brandId = session?.user?.brandId;
      if (!brandId) throw new Error("No brand ID available");

      console.log("🚀 Fetching prospect profiles from API, brandId:", brandId);

      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${backendUrl}/api/brand/${brandId}/prospect/profiles`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Plum-UI/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch prospect profiles: ${response.statusText}`
        );
      }

      return response.json();
    },
    enabled: !!session?.user?.brandId, // Only enable when brandId is available
    refetchInterval: 30000, // Poll every 30 seconds for updates
    refetchOnWindowFocus: true,
  });
}
