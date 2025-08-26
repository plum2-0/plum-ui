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
    llm_explanation?: string;
  }>;
  content_signals?: {
    topics: string[];
  };
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
  inbox_status?: "REPLIED" | "UNACTIONED" | "SUGGESTED_REPLY";
  last_contacted_subreddit?: string;
  last_contact_time?: string;
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
  const { data: session, status: sessionStatus } = useSession();

  // Debug logging for session state
  console.log("🔍 [useProspectProfilesQuery] Session status:", sessionStatus);
  console.log("🔍 [useProspectProfilesQuery] Session data:", session);
  console.log("🔍 [useProspectProfilesQuery] BrandId:", session?.user?.brandId);
  console.log(
    "🔍 [useProspectProfilesQuery] Query enabled:",
    !!session?.user?.brandId
  );

  return useQuery<ProspectProfile[]>({
    queryKey: [...PROSPECT_PROFILES_QUERY_KEY, session?.user?.brandId],
    queryFn: async () => {
      const brandId = session?.user?.brandId;
      console.log("🚀 [queryFn] Starting fetch with brandId:", brandId);

      if (!brandId) {
        console.error(
          "❌ [queryFn] No brand ID available, user needs to re-authenticate"
        );
        // Throw an auth-specific error that can be caught and handled
        const error = new Error(
          "Authentication required: No brand ID found in session. Please log out and log back in."
        );
        (error as any).code = "AUTH_MISSING_BRAND_ID";
        throw error;
      }

      console.log("🚀 Fetching prospect profiles from API, brandId:", brandId);

      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      console.log("📡 [queryFn] API URL:", backendUrl);
      console.log(
        "📡 [queryFn] Full endpoint:",
        `${backendUrl}/api/brand/${brandId}/prospect/profiles`
      );

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

      console.log("📡 [queryFn] Response status:", response.status);
      console.log("📡 [queryFn] Response ok:", response.ok);

      if (!response.ok) {
        console.error("❌ [queryFn] Fetch failed:", response.statusText);
        throw new Error(
          `Failed to fetch prospect profiles: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("✅ [queryFn] Data received:", data);
      return data;
    },
    enabled: !!session?.user?.brandId, // Only enable when brandId is available
    refetchInterval: 30000, // Poll every 30 seconds for updates
    refetchOnWindowFocus: true,
  });
}
