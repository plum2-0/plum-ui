import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RedditPost, Brand } from "@/types/brand";

const API_BASE =
  process.env.NEXT_PUBLIC_PLUM_API_BASE_URL || "http://localhost:8000";

interface ProspectPostActionParams {
  post: RedditPost;
  action: "queue" | "ignore" | "reply";
  brandId: string;
  brandName?: string;
  brandDetail?: string;
  prospectId: string;
  problem?: string;
  replyContent?: string;
  agentId?: string;
}

interface ProspectPostActionRequest {
  user_content_action: "queue" | "ignore" | "reply";
  brand_name?: string;
  brand_detail?: string;
  problem?: string;
  reddit_post: {
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
    thumbnail?: string;
    link_flair?: string;
    suggested_agent_reply?: string | null;
    status: string;
  };
  reply_content?: string;
  agent_id?: string;
  brand_id: string;
  prospect_id: string;
}

export function useProspectPostAction() {
  const queryClient = useQueryClient();

  return useMutation<
    boolean,
    Error,
    ProspectPostActionParams,
    { previousBrandData?: { brand: Brand } }
  >({
    onMutate: async ({ post, action, brandId }) => {
      // Cancel any outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["brand", brandId] });

      // Snapshot the previous value
      const previousBrandData = queryClient.getQueryData<{ brand: Brand }>([
        "brand",
        brandId,
      ]);

      // Optimistically update the cache
      if (previousBrandData?.brand) {
        queryClient.setQueryData<{ brand: Brand }>(["brand", brandId], (old) => {
          if (!old?.brand) return old;

          // Create a deep copy of the brand data
          const updatedBrand = JSON.parse(JSON.stringify(old.brand));

          // Find and update the post status based on action
          if (action === "queue") {
            // Update post status to QUEUED or remove from available posts
            // This depends on your data structure
            if (updatedBrand.prospect_profiles) {
              updatedBrand.prospect_profiles.forEach((profile: any) => {
                if (profile.reddit_posts) {
                  profile.reddit_posts = profile.reddit_posts.filter(
                    (p: RedditPost) => p.thing_id !== post.thing_id
                  );
                }
              });
            }
          } else if (action === "ignore") {
            // Remove the post from available posts when ignored
            if (updatedBrand.prospect_profiles) {
              updatedBrand.prospect_profiles.forEach((profile: any) => {
                if (profile.reddit_posts) {
                  profile.reddit_posts = profile.reddit_posts.filter(
                    (p: RedditPost) => p.thing_id !== post.thing_id
                  );
                }
              });
            }
          }

          return {
            ...old,
            brand: updatedBrand,
          };
        });
      }

      // Return context with previous data for rollback
      return { previousBrandData };
    },
    mutationFn: async ({
      post,
      action,
      brandId,
      brandName,
      brandDetail,
      prospectId,
      problem,
      replyContent,
      agentId,
    }) => {
      const payload: ProspectPostActionRequest = {
        user_content_action: action,
        brand_name: brandName,
        brand_detail: brandDetail,
        problem: problem,
        reddit_post: {
          thing_id: post.thing_id,
          title: post.title,
          content: post.content || '',
          author: post.author,
          subreddit: post.subreddit,
          permalink: post.permalink,
          created_utc: post.created_utc,
          score: post.score,
          upvotes: post.upvotes,
          downvotes: post.downvotes,
          reply_count: post.reply_count,
          thumbnail: post.thumbnail,
          link_flair: post.link_flair,
          suggested_agent_reply: post.suggested_agent_reply,
          status: post.status,
        },
        reply_content: replyContent,
        agent_id: agentId,
        brand_id: brandId,
        prospect_id: prospectId,
      };

      const response = await fetch(`${API_BASE}/api/brand/post/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error response:", errorText);
        throw new Error(errorText || "Failed to perform post action");
      }

      const result = await response.json();
      return result;
    },
    onError: (error, variables, context) => {
      console.error("Error performing prospect post action:", error);
      
      // Rollback optimistic update on error
      if (context?.previousBrandData) {
        queryClient.setQueryData(
          ["brand", variables.brandId],
          context.previousBrandData
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["brand", variables.brandId] });
      queryClient.invalidateQueries({ queryKey: ["brand"] });
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      queryClient.invalidateQueries({
        queryKey: ["prospect-profiles", variables.brandId],
      });
    },
  });
}
