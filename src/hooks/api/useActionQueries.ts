import { useQuery } from "@tanstack/react-query";

interface Stats {
  todaysEngagements: number;
  todaysEngagementsChange: string;
  weeklyGrowth: string;
  weeklyGrowthValue: number;
  successRate: number;
  successRateChange: string;
  karmaGained: number;
  karmaGainedChange: string;
  pendingActions: number;
  pendingActionsUrgent: number;
}

interface TimelineEvent {
  id: string;
  time: string;
  type: "post" | "comment" | "like" | "follow";
  title: string;
  status: "scheduled" | "completed" | "failed" | "in_progress" | "planned";
  subreddit: string;
  confidence?: number;
  count?: number;
  karma?: number;
}

interface TimelineSection {
  date: string;
  events: TimelineEvent[];
}

interface TimelineData {
  today: TimelineSection;
  tomorrow: TimelineSection;
  upcoming: TimelineSection;
  completed: TimelineSection;
}

export const ACTION_QUERY_KEYS = {
  stats: ["actions", "stats"] as const,
  timeline: ["actions", "timeline"] as const,
} as const;

export function useActionStats() {
  return useQuery<Stats>({
    queryKey: ACTION_QUERY_KEYS.stats,
    queryFn: async () => {
      const response = await fetch("/api/actions/stats");
      
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      
      return response.json();
    },
    // Cache persists indefinitely - no auto-refresh
  });
}

export function useActionTimeline() {
  return useQuery<{ timeline: TimelineData }>({
    queryKey: ACTION_QUERY_KEYS.timeline,
    queryFn: async () => {
      const response = await fetch("/api/actions/timeline");
      
      if (!response.ok) {
        throw new Error("Failed to fetch timeline");
      }
      
      return response.json();
    },
    // Cache persists indefinitely - no auto-refresh
  });
}