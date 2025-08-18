import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Brand } from "@/types/brand";

export const BRAND_QUERY_KEY = ["brand"] as const;

export function useBrandQuery() {
  const router = useRouter();
  const { data: session, status } = useSession();

  return useQuery<{ brand: Brand }>({
    queryKey: BRAND_QUERY_KEY,
    queryFn: async () => {
      // Check if user is authenticated
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Get brandId from session, fallback to checking if user needs onboarding
      const brandId = session.user.brandId;

      if (!brandId) {
        // If no brandId in session, user likely needs onboarding
        router.push("/onboarding");
        throw new Error("User needs onboarding");
      }

      // Call Python API directly
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/brand/${brandId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Plum-UI/1.0",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend API error:", errorText);

        if (response.status === 404) {
          router.push("/onboarding");
          throw new Error("User needs onboarding");
        }

        throw new Error(`Failed to fetch brand data: ${errorText}`);
      }

      const brandData = await response.json();

      // The Python API now returns the brand data directly, not wrapped in a response object
      return {
        brand: brandData,
      };
    },
    // Only run query when session is loaded and user is authenticated
    enabled: status !== "loading" && !!session?.user?.id,
    // Cache persists indefinitely - only mutations will invalidate
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry if user needs onboarding or is not authenticated
      if (
        error.message === "User needs onboarding" ||
        error.message === "User not authenticated"
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useGenerateUseCaseInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      brandId,
      title,
    }: {
      brandId: string;
      title: string;
    }) => {
      const query = encodeURIComponent(title);
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/brand/${brandId}/insight?problem=${query}`;

      const response = await fetch(url, {
        method: "GET",
        headers: { "User-Agent": "plum-ui" },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Failed to generate insight: ${response.status} ${text}`
        );
      }

      // After generating insight, refetch brand data to get updated use cases
      await queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEY });

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch brand data after successful generation
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEY });
    },
  });
}

export function useFetchNewPosts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      brandId,
      problemId,
    }: {
      brandId: string;
      problemId: string;
    }) => {
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${backendUrl}/api/brand/${brandId}/new/posts?problem_id=${problemId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Plum-UI/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch new posts: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.status !== "completed") {
        throw new Error("Failed to complete new posts fetch");
      }

      return result;
    },
    onError: (error) => {
      console.error("Error fetching new posts:", error);
      alert(`Failed to fetch new posts: ${error.message}`);
    },
  });
}
