import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserAction, PostActionResponse, RedditPostsResponse } from '@/types/reddit';

interface UsePostActionsOptions {
  projectId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface PostActionParams {
  postId: string;
  action: UserAction;
  editedResponse?: string;
}

export function usePostActions({ projectId, onSuccess, onError }: UsePostActionsOptions) {
  const queryClient = useQueryClient();

  return useMutation<PostActionResponse, Error, PostActionParams>({
    mutationFn: async ({ postId, action, editedResponse }) => {
      const response = await fetch(
        `/api/projects/${projectId}/reddit-posts/${postId}/action`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action, edited_response: editedResponse }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update post action');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: ['reddit-posts', projectId] },
        (oldData: RedditPostsResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            posts: oldData.posts.map(post =>
              post.post_id === variables.postId
                ? { 
                    ...post, 
                    user_action: variables.action,
                    ...(variables.editedResponse && { llm_response: variables.editedResponse })
                  }
                : post
            ),
          };
        }
      );

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['reddit-posts', projectId] });

      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error updating post action:', error);
      onError?.(error);
    },
  });
}