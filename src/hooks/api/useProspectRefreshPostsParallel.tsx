import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BrandOffering } from "@/types/brand";
import { useToast } from "@/components/ui/Toast";
import { RefreshIcon } from "@/components/ui/RefreshIcon";
import { BRAND_QUERY_KEYS } from "@/hooks/api/useBrandQuery";
import { ScrapeJob } from "@/contexts/ScrapeJobContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

interface ParallelRefreshParams {
  brandId: string;
  brandOfferings?: BrandOffering[];
  scrapeJobs: ScrapeJob[];
}

interface ParallelRefreshResult {
  totalPosts: number;
  successfulJobs: number;
  failedJobs: number;
  results: Array<{
    prospectId: string;
    success: boolean;
    postsCount?: number;
    error?: string;
  }>;
}

export function useProspectRefreshPostsParallel() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<ParallelRefreshResult, Error, ParallelRefreshParams>({
    mutationFn: async ({ brandId, brandOfferings, scrapeJobs }) => {
      // Create promises for all scrape jobs
      const promises = scrapeJobs.map(async (job) => {
        const payload: ProspectRefreshPostsRequest = {
          brand_name: job.brandName,
          brand_offerings: brandOfferings?.map((offering) => ({
            title: offering.title,
            description: offering.description,
          })),
          problem_to_solve: job.problemToSolve,
          keywords: job.keywords,
        };

        try {
          const response = await fetch(
            `${API_BASE_URL}/api/brand/${brandId}/prospect/${job.prospectId}/post/refresh`,
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
            throw new Error(errorText || "Failed to refresh posts");
          }

          const result: ProspectRefreshPostsResponse = await response.json();
          return {
            prospectId: job.prospectId,
            success: true,
            postsCount: result.appended_count,
          };
        } catch (error) {
          console.error(
            `Error refreshing posts for prospect ${job.prospectId}:`,
            error
          );
          return {
            prospectId: job.prospectId,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      });

      // Execute all promises in parallel
      const results = await Promise.allSettled(promises);

      // Process results
      let totalPosts = 0;
      let successfulJobs = 0;
      let failedJobs = 0;
      const processedResults = results.map((result) => {
        if (result.status === "fulfilled") {
          const jobResult = result.value;
          if (jobResult.success) {
            successfulJobs++;
            totalPosts += jobResult.postsCount || 0;
          } else {
            failedJobs++;
          }
          return jobResult;
        } else {
          failedJobs++;
          return {
            prospectId: "unknown",
            success: false,
            error: result.reason?.message || "Unknown error",
          };
        }
      });

      return {
        totalPosts,
        successfulJobs,
        failedJobs,
        results: processedResults,
      };
    },
    onSuccess: (data, variables) => {
      // Invalidate brand queries to refresh the prospects data
      if (variables?.brandId) {
        queryClient.invalidateQueries({
          queryKey: BRAND_QUERY_KEYS.detail(variables.brandId),
        });
      }
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.all });

      // Show beautiful liquid glass neumorphic toast
      if (data.successfulJobs > 0) {
        showToast({
          message: `✨ Successfully refreshed ${data.totalPosts} new ${
            data.totalPosts === 1 ? "post" : "posts"
          } across ${data.successfulJobs} ${
            data.successfulJobs === 1 ? "prospect" : "prospects"
          }`,
          type: "success",
          duration: 6000,
          icon: <RefreshIcon className="h-6 w-6" />,
        });
      }

      if (data.failedJobs > 0) {
        showToast({
          message: `⚠️ Failed to refresh ${data.failedJobs} ${
            data.failedJobs === 1 ? "job" : "jobs"
          }`,
          type: "error",
          duration: 6000,
        });
      }

      console.log(
        `Parallel refresh completed: ${data.successfulJobs} successful, ${data.failedJobs} failed, ${data.totalPosts} total posts`
      );
    },
    onError: (error) => {
      console.error("Error in parallel refresh:", error);
      showToast({
        message: "Failed to refresh posts. Please try again.",
        type: "error",
        duration: 6000,
      });
    },
  });
}