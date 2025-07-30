import { useQuery } from '@tanstack/react-query';
import { RedditPostsResponse } from '@/types/reddit';

interface UseRedditPostsOptions {
  projectId: string;
  status?: 'all' | 'pending' | 'reviewed';
  limit?: number;
  offset?: number;
}

export function useRedditPosts({ 
  projectId, 
  status = 'all', 
  limit = 20, 
  offset = 0 
}: UseRedditPostsOptions) {
  return useQuery<RedditPostsResponse>({
    queryKey: ['reddit-posts', projectId, status, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(status !== 'all' && { status }),
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(
        `/api/projects/${projectId}/reddit-posts?${params}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Reddit posts');
      }

      return response.json();
    },
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}