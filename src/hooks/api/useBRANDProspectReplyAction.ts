import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RedditPost } from "@/types/brand";

const API_BASE =
  process.env.NEXT_PUBLIC_PLUM_API_BASE_URL || "http://localhost:8000";

interface ProspectReplyActionParams {
  brandId: string;
  prospectId: string;
  postId: string;
  content: string;
  agentId?: string;
  post: RedditPost;
}

interface ProspectReplyActionRequest {
  brand_id: string;
  prospect_id: string;
  user_content_action: "reply";
  reply_content: string;
  reddit_post: RedditPost;
  agent_id?: string;
}

export function useBRANDProspectReplyAction() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, ProspectReplyActionParams>({
    mutationFn: async ({
      brandId,
      prospectId,
      postId,
      content,
      agentId,
      post,
    }) => {
      const payload: ProspectReplyActionRequest = {
        brand_id: brandId,
        prospect_id: prospectId,
        user_content_action: "reply",
        reply_content: content,
        reddit_post: post,
        agent_id: agentId,
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
        throw new Error(errorText || "Failed to submit reply");
      }

      const result = await response.json();
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refresh data if needed
      // queryClient.invalidateQueries({ queryKey: ["prospects"] });
    },
    onError: (error) => {
      console.error("Error submitting reply:", error);
    },
  });
}
