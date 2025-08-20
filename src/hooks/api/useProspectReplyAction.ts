import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE =
  process.env.NEXT_PUBLIC_PLUM_API_BASE_URL || "http://localhost:8000";

interface ProspectReplyActionParams {
  brandId: string;
  prospectId: string;
  postId: string;
  content: string;
  agentId?: string;
}

interface ProspectReplyActionRequest {
  brand_id: string;
  prospect_id: string;
  post_id: string;
  user_content_action: "reply";
  content: string;
  agent_id?: string;
}

export function useProspectReplyAction() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, ProspectReplyActionParams>({
    mutationFn: async ({
      brandId,
      prospectId,
      postId,
      content,
      agentId,
    }) => {
      const payload: ProspectReplyActionRequest = {
        brand_id: brandId,
        prospect_id: prospectId,
        post_id: postId,
        user_content_action: "reply",
        content,
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