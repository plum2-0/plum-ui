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

      const data: RedditPostsResponse = await response.json();
      
      // Filter out ignored posts
      const filteredPosts = data.posts.filter(post => post.user_action !== 'ignore');
      
      // Update total count to reflect filtered results
      const ignoredCount = data.posts.length - filteredPosts.length;
      
      return {
        ...data,
        posts: filteredPosts,
        total_count: data.total_count - ignoredCount,
      };
    },
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}