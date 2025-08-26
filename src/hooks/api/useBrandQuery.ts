import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { Brand } from "@/types/brand";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Error types for better error handling
class BrandQueryError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public needsOnboarding?: boolean
  ) {
    super(message);
    this.name = "BrandQueryError";
  }
}

// Modern query keys pattern with proper typing
export const BRAND_QUERY_KEYS = {
  all: ["brand"] as const,
  details: () => [...BRAND_QUERY_KEYS.all, "detail"] as const,
  detail: (brandId: string) =>
    [...BRAND_QUERY_KEYS.details(), brandId] as const,
} as const;

// Utility function to extract brand ID from multiple sources
function getBrandId(session: any): string | null {
  // Try to get brandId from cookie first (most immediate after onboarding)
  if (typeof window !== "undefined") {
    const cookies = document.cookie.split("; ");
    const brandIdCookie = cookies.find((cookie) =>
      cookie.startsWith("brand_id=")
    );
    if (brandIdCookie) {
      return brandIdCookie.split("=")[1];
    }
  }

  console.log("----", session);

  // Fallback to session brandId if cookie not found
  return session?.user?.brandId || null;
}

function clearBrandCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "brand_id=; Max-Age=0; path=/";
  }
}

// API function for fetching brand data
async function fetchBrandData(brandId: string): Promise<Brand> {
  const response = await fetch(`${API_BASE_URL}/api/brand/${brandId}`, {
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
      throw new BrandQueryError("User needs onboarding", 404, true);
    }

    throw new BrandQueryError(
      `Failed to fetch brand data: ${errorText}`,
      response.status
    );
  }

  const brandData = await response.json();
  return brandData;
}

// Main hook with modern TanStack Query patterns
export function useBrandQuery() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const brandId = getBrandId(session);
  const hasRedirectedRef = useRef(false);

  const redirectToOnboarding = () => {
    if (typeof window === "undefined") return;
    if (hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;
    router.push("/onboarding");
  };
  const queryResult = useQuery({
    // Include brandId in query key for better cache isolation
    queryKey: brandId ? BRAND_QUERY_KEYS.detail(brandId) : BRAND_QUERY_KEYS.all,
    queryFn: async (): Promise<{ brand: Brand }> => {
      // Check if user is authenticated
      if (!session?.user?.id) {
        throw new BrandQueryError("User not authenticated");
      }

      if (!brandId) {
        // If no brandId in cookies or session, user likely needs onboarding
        redirectToOnboarding();
        throw new BrandQueryError("User needs onboarding", undefined, true);
      }

      let brandData: Brand;
      try {
        brandData = await fetchBrandData(brandId);
      } catch (error) {
        if (
          error instanceof BrandQueryError &&
          (error.needsOnboarding || error.statusCode === 404)
        ) {
          clearBrandCookie();
          redirectToOnboarding();
        }
        throw error;
      }

      return {
        brand: brandData,
      };
    },
    // Run when session is ready and user is authenticated
    enabled: status !== "loading" && !!session?.user?.id,
    // Modern cache settings
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in v5)
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      // Don't retry if user needs onboarding or is not authenticated
      if (error instanceof BrandQueryError && error.needsOnboarding) {
        return false;
      }
      if (
        error instanceof BrandQueryError &&
        error.message === "User not authenticated"
      ) {
        return false;
      }
      return failureCount < 3;
    },
    // Modern error handling
    throwOnError: false, // Let the component handle errors gracefully
    // Add network mode for better offline handling
    networkMode: "online",
  });

  useEffect(() => {
    const error = queryResult.error as unknown;
    if (
      error instanceof BrandQueryError &&
      (error.needsOnboarding || error.statusCode === 404)
    ) {
      clearBrandCookie();
      redirectToOnboarding();
    }
  }, [queryResult.error, redirectToOnboarding]);

  return queryResult;
}

// Types for mutation parameters
interface GenerateUseCaseInsightParams {
  brandId: string;
  title: string;
}

// API function for generating use case insights
async function generateUseCaseInsight({
  brandId,
  title,
}: GenerateUseCaseInsightParams) {
  const query = encodeURIComponent(title);
  const url = `${API_BASE_URL}/api/brand/${brandId}/insight?problem=${query}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "plum-ui",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new BrandQueryError(
      `Failed to generate insight: ${text}`,
      response.status
    );
  }

  return response.json();
}

export function useGenerateUseCaseInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateUseCaseInsight,
    onSuccess: () => {
      // Invalidate and refetch brand data after successful generation
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.all });
    },
    onError: (error) => {
      console.error("Failed to generate use case insight:", error);
    },
  });
}

// Types for fetch new posts mutation
interface FetchNewPostsParams {
  brandId: string;
  problemId: string;
}

interface FetchNewPostsResponse {
  status: string;
  [key: string]: any;
}

// API function for fetching new posts
async function fetchNewPosts({
  brandId,
  problemId,
}: FetchNewPostsParams): Promise<FetchNewPostsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/brand/${brandId}/new/posts?problem_id=${problemId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Plum-UI/1.0",
      },
    }
  );

  if (!response.ok) {
    throw new BrandQueryError(
      `Failed to fetch new posts: ${response.statusText}`,
      response.status
    );
  }

  const result = await response.json();

  if (result.status !== "completed") {
    throw new BrandQueryError("Failed to complete new posts fetch");
  }

  return result;
}

export function useFetchNewPosts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fetchNewPosts,
    onSuccess: () => {
      // Invalidate relevant queries after successful fetch
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.all });
    },
    onError: (error) => {
      console.error("Error fetching new posts:", error);
      // Better user experience - don't use alert, let the component handle the error
    },
  });
}

// Additional helper hooks for better developer experience

/**
 * Hook to invalidate brand queries manually
 */
export function useInvalidateBrandQuery() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.all });
  };
}

/**
 * Hook to get cached brand data without triggering a fetch
 */
export function useCachedBrandData() {
  const queryClient = useQueryClient();

  return queryClient.getQueryData(BRAND_QUERY_KEYS.all) as
    | { brand: Brand }
    | undefined;
}

/**
 * Hook to prefetch brand data
 */
export function usePrefetchBrandData() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return (brandId?: string) => {
    const id = brandId || getBrandId(session);
    if (!id) return;

    queryClient.prefetchQuery({
      queryKey: BRAND_QUERY_KEYS.detail(id),
      queryFn: () => fetchBrandData(id).then((brand) => ({ brand })),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
}
