import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RedditPost } from "@/types/brand";

export const PROSPECTS_QUERY_KEY = ["prospects"] as const;

// Hook to fetch prospects (Reddit posts)
export function useProspectsQuery(enabled = true) {
  return useQuery<RedditPost[]>({
    queryKey: PROSPECTS_QUERY_KEY,
    queryFn: async () => {
      // TODO: Implement actual API call when backend is ready
      // For now, return empty array
      console.log("Fetching prospects (no-op for now)");
      return [];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to like a prospect
export function useLikeProspectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      // TODO: Implement actual API call when backend is ready
      console.log("Liking prospect:", postId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { success: true, postId };
    },
    onSuccess: () => {
      // Invalidate and refetch prospects after liking
      queryClient.invalidateQueries({ queryKey: PROSPECTS_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Error liking prospect:", error);
    },
  });
}

// Hook to ignore/dismiss a prospect
export function useIgnoreProspectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      // TODO: Implement actual API call when backend is ready
      console.log("Ignoring prospect:", postId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { success: true, postId };
    },
    onSuccess: () => {
      // Invalidate and refetch prospects after ignoring
      queryClient.invalidateQueries({ queryKey: PROSPECTS_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Error ignoring prospect:", error);
    },
  });
}

// Hook to batch update prospect actions
export function useBatchProspectActionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (actions: { postId: string; action: 'like' | 'ignore' }[]) => {
      // TODO: Implement actual API call when backend is ready
      console.log("Batch updating prospect actions:", actions);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, processedCount: actions.length };
    },
    onSuccess: () => {
      // Invalidate and refetch prospects after batch update
      queryClient.invalidateQueries({ queryKey: PROSPECTS_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Error batch updating prospects:", error);
    },
  });
}