import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RedditPost } from "@/types/brand";
import { ensureRedditConnectedOrRedirect } from "@/lib/verify-reddit";

const API_BASE =
  process.env.NEXT_PUBLIC_PLUM_API_BASE_URL || "http://localhost:8000";

interface ProspectConvoReplyParams {
  brandId: string;
  prospectProfileId: string;
  activeConvoId: string;
  parentPostThingId: string; // thing id of the comment/post we are replying to (t1_* or t3_*)
  replyText: string;
}

interface ProspectConvoReplyRequest {
  prospect_profile_id: string;
  active_convo_id: string;
  parent_post_thing_id: string;
  reply_text: string;
}

/**
 * Hook for sending a reply to a prospect conversation using the new API endpoint.
 * This hook uses the endpoint: POST /api/brand/{brand_id}/prospect/profiles/convo/reply
 * It includes Reddit connection verification before sending the reply.
 */
export function useProspectConvoReply() {
  const queryClient = useQueryClient();

  return useMutation<RedditPost, Error, ProspectConvoReplyParams>({
    mutationFn: async ({
      brandId,
      prospectProfileId,
      activeConvoId,
      parentPostThingId,
      replyText,
    }) => {
      // Check Reddit connection first - will throw/redirect if not connected
      await ensureRedditConnectedOrRedirect();

      const payload: ProspectConvoReplyRequest = {
        prospect_profile_id: prospectProfileId,
        active_convo_id: activeConvoId,
        parent_post_thing_id: parentPostThingId,
        reply_text: replyText,
      };

      const response = await fetch(
        `${API_BASE}/api/brand/${brandId}/prospect/profiles/convo/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error response:", errorText);
        throw new Error(errorText || "Failed to send reply");
      }

      const result: RedditPost = await response.json();
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refresh conversation data
      queryClient.invalidateQueries({
        queryKey: ["prospect-profiles", variables.brandId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "prospect-profile",
          variables.brandId,
          variables.prospectProfileId,
        ],
      });
    },
    onError: (error) => {
      console.error("Error sending prospect conversation reply:", error);
    },
  });
}
