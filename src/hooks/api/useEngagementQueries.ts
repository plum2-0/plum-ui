import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CommentSuggestion {
  action_id: string;
  brand_id: string;
  status: "pending" | "scheduled" | "completed" | "dismissed";
  action_title: string;
  post: {
    id: string;
    post_id: string;
    subreddit: string;
    title: string;
    author: string;
    content: string;
    link: string;
    image?: string | null;
    up_votes?: number;
    num_comments?: number;
  };
  llm_generated_reply: string;
  intent?: string;
  problem?: string;
}

export const ENGAGEMENT_QUERY_KEYS = {
  suggestions: ["engagement", "suggestions"] as const,
} as const;

export function useCommentSuggestions() {
  return useQuery<{ suggestions: CommentSuggestion[] }>({
    queryKey: ENGAGEMENT_QUERY_KEYS.suggestions,
    queryFn: async () => {
      const response = await fetch("/api/engagement/comment-suggestions");

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to load suggestions");
      }

      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useGenerateCommentSuggestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(
        "/api/engagement/comment-suggestions/generate",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to generate suggestions");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate suggestions query to refetch latest data
      queryClient.invalidateQueries({
        queryKey: ENGAGEMENT_QUERY_KEYS.suggestions,
      });
    },
    onError: (error) => {
      console.error("Error generating suggestions:", error);
    },
  });
}
