import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BrandOffering } from "@/types/brand";
import { useToast } from "@/components/ui/Toast";
import { RefreshIcon } from "@/components/ui/RefreshIcon";

const API_BASE =
  process.env.NEXT_PUBLIC_PLUM_API_BASE_URL || "http://localhost:8000";

interface ProspectRefreshPostsParams {
  brandId: string;
  prospectId: string;
  brandName: string;
  brandOfferings?: BrandOffering[];
  problemToSolve: string;
  keywords?: string[];
}

interface ProspectRefreshPostsRequest {
  brand_name: string;
  brand_offerings?: Array<{ title: string; description: string }>;
  problem_to_solve: string;
  keywords?: string[];
}

interface ProspectRefreshPostsResponse {
  appended_count: number;
  new_posts: any[];
}

export function useProspectRefreshPosts() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<
    ProspectRefreshPostsResponse,
    Error,
    ProspectRefreshPostsParams
  >({
    mutationFn: async ({
      brandId,
      prospectId,
      brandName,
      brandOfferings,
      problemToSolve,
      keywords,
    }) => {
      const payload: ProspectRefreshPostsRequest = {
        brand_name: brandName,
        brand_offerings: brandOfferings?.map((offering) => ({
          title: offering.title,
          description: offering.description,
        })),
        problem_to_solve: problemToSolve,
        keywords: keywords,
      };

      const response = await fetch(
        `${API_BASE}/api/brand/${brandId}/prospect/${prospectId}/post/refresh`,
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
        throw new Error(errorText || "Failed to refresh posts");
      }

      const result = await response.json();
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate brand query to refresh the prospects data
      queryClient.invalidateQueries({ queryKey: ["brand"] });

      // Show beautiful liquid glass neumorphic toast
      showToast({
        message: `✨ Successfully refreshed ${data.appended_count} new ${
          data.appended_count === 1 ? "post" : "posts"
        }`,
        type: "success",
        duration: 6000,
        icon: <RefreshIcon className="h-6 w-6" />,
      });

      console.log(
        `Successfully refreshed posts. Added ${data.appended_count} new posts.`
      );
    },
    onError: (error) => {
      console.error("Error refreshing posts:", error);
    },
  });
}
