import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export interface ProspectProfile {
  id?: string;
  name: string;
  profile_image?: string;
  prospect_source?: string;
  prospect_source_id?: string;
  active_convo?: Conversation;
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
const generateMockProfiles = (): ProspectProfile[] => {
  const mockProfiles: ProspectProfile[] = [
    {
      id: "mock-1",
      name: "tech_enthusiast_42",
      profile_image: "https://i.pravatar.cc/150?img=1",
      prospect_source: "REDDIT",
      prospect_source_id: "t3_mock1",
      lastMessageTime: Date.now() - 3600000, // 1 hour ago
      unreadCount: 2,
      engagementScore: 85,
      sentiment: "positive",
      tags: ["High Value", "Tech Savvy"],
      interestedUseCase: "Productivity Tools",
      status: "PENDING",
      active_convo: {
        id: "convo-1",
        reddit_conversations: [
          {
            thing_id: "t3_mock1",
            title: "Looking for productivity tool recommendations",
            content:
              "Looking for recommendations on productivity tools that can help with team collaboration. Our startup is growing and we need something that scales well...",
            author: "tech_enthusiast_42",
            subreddit: "productivity",
            permalink: "/r/productivity/comments/mock1",
            created_utc: Date.now() / 1000 - 7200,
            score: 45,
            upvotes: 50,
            downvotes: 5,
            reply_count: 12,
            status: "PENDING",
            suggested_agent_reply:
              "Hey! Based on your team's needs, you might want to check out collaborative tools that integrate well with existing workflows. What specific features are most important for your team?",
          },
          {
            thing_id: "t1_reply1",
            content:
              "Thanks for the suggestions everyone! We're particularly interested in tools that have good API integrations.",
            author: "tech_enthusiast_42",
            subreddit: "productivity",
            permalink: "/r/productivity/comments/mock1/reply1",
            created_utc: Date.now() / 1000 - 3600,
            score: 12,
            upvotes: 15,
            downvotes: 3,
            reply_count: 3,
            status: "PENDING",
          },
        ],
      },
    },
    {
      id: "mock-2",
      name: "small_biz_owner",
      profile_image: "https://i.pravatar.cc/150?img=2",
      prospect_source: "REDDIT",
      prospect_source_id: "t3_mock2",
      lastMessageTime: Date.now() - 7200000, // 2 hours ago
      unreadCount: 0,
      engagementScore: 72,
      sentiment: "neutral",
      tags: ["Small Business", "Budget Conscious"],
      interestedUseCase: "CRM Solutions",
      status: "REPLY",
      active_convo: {
        id: "convo-2",
        reddit_conversations: [
          {
            thing_id: "t3_mock2",
            title: "Small business CRM recommendations?",
            content:
              "Running a small consulting firm with 5 employees. Need a CRM that won't break the bank but still has good features. Any suggestions?",
            author: "small_biz_owner",
            subreddit: "smallbusiness",
            permalink: "/r/smallbusiness/comments/mock2",
            created_utc: Date.now() / 1000 - 14400,
            score: 28,
            upvotes: 32,
            downvotes: 4,
            reply_count: 8,
            status: "REPLY",
          },
        ],
      },
    },
    {
      id: "mock-3",
      name: "marketing_maven",
      profile_image: "https://i.pravatar.cc/150?img=3",
      prospect_source: "REDDIT",
      prospect_source_id: "t3_mock3",
      lastMessageTime: Date.now() - 10800000, // 3 hours ago
      unreadCount: 5,
      engagementScore: 92,
      sentiment: "positive",
      tags: ["Influencer", "Active Engager", "Marketing Pro"],
      interestedUseCase: "Social Media Management",
      status: "SUGGESTED_REPLY",
      active_convo: {
        id: "convo-3",
        reddit_conversations: [
          {
            thing_id: "t3_mock3",
            title: "Best social media management tools in 2024?",
            content:
              "I've been using Buffer for years but wondering if there are better alternatives now. Looking for something with good analytics and multi-platform support.",
            author: "marketing_maven",
            subreddit: "marketing",
            permalink: "/r/marketing/comments/mock3",
            created_utc: Date.now() / 1000 - 21600,
            score: 156,
            upvotes: 170,
            downvotes: 14,
            reply_count: 42,
            status: "SUGGESTED_REPLY",
            suggested_agent_reply:
              "Great question! The social media management landscape has evolved significantly. Have you considered tools that offer AI-powered content suggestions and automated scheduling based on engagement patterns?",
          },
        ],
      },
    },
    {
      id: "mock-4",
      name: "startup_founder_101",
      profile_image: "https://i.pravatar.cc/150?img=4",
      prospect_source: "REDDIT",
      prospect_source_id: "t3_mock4",
      lastMessageTime: Date.now() - 1800000, // 30 minutes ago
      unreadCount: 1,
      engagementScore: 78,
      sentiment: "neutral",
      tags: ["Startup", "B2B Focus"],
      interestedUseCase: "Customer Support Automation",
      status: "PENDING",
      active_convo: {
        id: "convo-4",
        reddit_conversations: [
          {
            thing_id: "t3_mock4",
            content:
              "Looking for advice on scaling customer support without hiring a huge team. We're at 50 customers now and growing fast.",
            author: "startup_founder_101",
            subreddit: "startups",
            permalink: "/r/startups/comments/mock4",
            created_utc: Date.now() / 1000 - 1800,
            score: 23,
            upvotes: 26,
            downvotes: 3,
            reply_count: 7,
            status: "PENDING",
          },
        ],
      },
    },
    {
      id: "mock-5",
      name: "ecommerce_expert",
      profile_image: "https://i.pravatar.cc/150?img=5",
      prospect_source: "REDDIT",
      prospect_source_id: "t3_mock5",
      lastMessageTime: Date.now() - 14400000, // 4 hours ago
      unreadCount: 0,
      engagementScore: 65,
      sentiment: "negative",
      tags: ["E-commerce", "Needs Attention"],
      interestedUseCase: "Inventory Management",
      status: "REPLY",
      active_convo: {
        id: "convo-5",
        reddit_conversations: [
          {
            thing_id: "t3_mock5",
            title: "Frustrated with current inventory management",
            content:
              "Our current system is a mess. Constant sync issues between online and physical store. Anyone else dealing with this?",
            author: "ecommerce_expert",
            subreddit: "ecommerce",
            permalink: "/r/ecommerce/comments/mock5",
            created_utc: Date.now() / 1000 - 28800,
            score: 89,
            upvotes: 95,
            downvotes: 6,
            reply_count: 31,
            status: "IGNORE",
          },
        ],
      },
    },
    {
      id: "mock-6",
      name: "saas_curious",
      profile_image: "https://i.pravatar.cc/150?img=6",
      prospect_source: "REDDIT",
      prospect_source_id: "t3_mock6",
      lastMessageTime: Date.now() - 600000, // 10 minutes ago
      unreadCount: 3,
      engagementScore: 88,
      sentiment: "positive",
      tags: ["Hot Lead", "Ready to Buy"],
      interestedUseCase: "Project Management",
      status: "SUGGESTED_REPLY",
      active_convo: {
        id: "convo-6",
        reddit_conversations: [
          {
            thing_id: "t3_mock6",
            content:
              "Ready to invest in a proper project management tool. Budget approved for up to $500/month. What are the top enterprise options?",
            author: "saas_curious",
            subreddit: "projectmanagement",
            permalink: "/r/projectmanagement/comments/mock6",
            created_utc: Date.now() / 1000 - 600,
            score: 34,
            upvotes: 38,
            downvotes: 4,
            reply_count: 15,
            status: "PENDING",
            suggested_agent_reply:
              "Congrats on getting budget approval! With $500/month, you have access to some excellent enterprise solutions. What size is your team and what are your must-have features?",
          },
        ],
      },
    },
  ];

  return mockProfiles;
};

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
