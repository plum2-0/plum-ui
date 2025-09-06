import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useBrandQuery } from "./api/useBrandQuery";

// Removed generic useRedirect in favor of explicit hooks below

/**
 * Hook for pages that require authentication but no brand (like onboarding)
 */
// export function useOnboardingRedirects() {
//   return useRedirect({
//     redirectIfUnauthenticated: "/auth/signin",
//     redirectIfHasBrand: "/dashboard/discover",
//   });
// }

/**
 * Hook for multi-brand onboarding that allows existing users to create new brands
 * Does not redirect users who already have brands - they can create additional brands
 */
export function useMultiBrandOnboardingRedirects() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const hasRedirectedRef = useRef(false);

  const isAuthenticated = status === "authenticated" && !!session?.user;

  // Still fetch brand to provide hasBrand state to consumers, but do not redirect away
  const { data: brandData, isLoading: brandLoading } = useBrandQuery({
    enabled: isAuthenticated,
    skipRedirect: true,
  });

  const hasBrand = !!brandData?.brand?.id;
  const isLoading = status === "loading" || (isAuthenticated && brandLoading);

  useEffect(() => {
    if (hasRedirectedRef.current || isLoading) return;

    // If not authenticated, go to signin
    if (!isAuthenticated && status === "unauthenticated") {
      hasRedirectedRef.current = true;
      router.push("/auth/signin");
      return;
    }
    // Authenticated users (with or without brand) remain on onboarding to allow creating additional brands
  }, [isAuthenticated, isLoading, status, router]);

  return {
    isLoading,
    isAuthenticated,
    hasBrand,
    brand: brandData?.brand,
    user: session?.user,
  };
}

/**
 * Hook for public pages that should redirect authenticated users
 */
export function usePublicPageRedirects() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const hasRedirectedRef = useRef(false);

  const isAuthenticated = status === "authenticated" && !!session?.user;

  const { data: brandData, isLoading: brandLoading } = useBrandQuery({
    enabled: isAuthenticated,
    skipRedirect: true,
  });

  const hasBrand = !!brandData?.brand?.id;
  const isLoading = status === "loading" || (isAuthenticated && brandLoading);

  useEffect(() => {
    if (hasRedirectedRef.current || isLoading) return;

    // Unauthenticated: stay on public page
    if (!isAuthenticated && status === "unauthenticated") return;

    // Authenticated: route based on brand presence once brand is loaded
    if (isAuthenticated && !brandLoading) {
      hasRedirectedRef.current = true;
      if (hasBrand) {
        router.push("/dashboard/discover");
      } else {
        router.push("/onboarding");
      }
    }
  }, [isAuthenticated, hasBrand, isLoading, brandLoading, status, router]);

  return { isLoading };
}

/**
 * Hook for the home page that checks both auth and brand status
 * before redirecting to the appropriate destination (no double redirect).
 */
export function useHomePageRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasRedirected = useRef(false);

  const isAuthenticated = status === "authenticated" && !!session?.user;

  // Only fetch brand if authenticated
  const { data: brandData, isLoading: brandLoading } = useBrandQuery({
    enabled: isAuthenticated,
    skipRedirect: true,
  });

  const hasBrand = !!brandData?.brand?.id;
  // Loading while checking auth or brand (if authenticated)
  const isLoading = status === "loading" || (isAuthenticated && brandLoading);

  useEffect(() => {
    // Skip if already redirected or still loading
    if (hasRedirected.current || isLoading) return;

    // Not authenticated - stay on home page
    if (!isAuthenticated && status === "unauthenticated") {
      return;
    }

    // Authenticated - decide where to go based on brand status
    if (isAuthenticated && !brandLoading) {
      hasRedirected.current = true;
      if (hasBrand) {
        // Has brand -> go directly to dashboard
        router.replace("/dashboard/discover");
      } else {
        // No brand -> go to onboarding
        router.replace("/onboarding");
      }
    }
  }, [isAuthenticated, hasBrand, isLoading, brandLoading, status, router]);

  return {
    isLoading,
    isRedirecting: hasRedirected.current,
  };
}

/**
 * Simple loading state hook for protected pages.
 * Handles auth and brand loading states with redirects.
 */
export function useProtectedPageLoading(requireBrand = true) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasRedirected = useRef(false);

  const isAuthenticated = status === "authenticated" && !!session?.user;

  const { data: brandData, isLoading: brandLoading } = useBrandQuery({
    enabled: requireBrand && isAuthenticated,
    skipRedirect: true,
  });

  const hasBrand = !!brandData?.brand?.id;
  const isLoading = status === "loading" || (requireBrand && brandLoading);

  useEffect(() => {
    if (hasRedirected.current || isLoading) return;

    // Not authenticated -> signin
    if (!isAuthenticated && status === "unauthenticated") {
      hasRedirected.current = true;
      router.push("/auth/signin");
      return;
    }

    // Needs brand but doesn't have one -> onboarding
    if (requireBrand && isAuthenticated && !hasBrand && !brandLoading) {
      hasRedirected.current = true;
      router.push("/onboarding");
      return;
    }
  }, [
    isAuthenticated,
    hasBrand,
    isLoading,
    brandLoading,
    status,
    requireBrand,
    router,
  ]);

  return { isLoading };
}

/**
 * Admin check with loading state
 */
export function useAdminPageLoading() {
  const { data: session } = useSession();
  const router = useRouter();
  const hasRedirected = useRef(false);

  // Simple admin check - adjust as needed
  const isAdmin =
    session?.user?.email?.includes("@plum.") ||
    ["lamtomoki@gmail.com", "truedrju@gmail.com"].includes(
      session?.user?.email || ""
    );

  const { isLoading } = useProtectedPageLoading(true);

  useEffect(() => {
    if (hasRedirected.current || isLoading) return;

    if (!isAdmin && session) {
      hasRedirected.current = true;
      router.push("/dashboard/discover");
    }
  }, [isAdmin, session, isLoading, router]);

  return { isLoading, isAdmin };
}

/**
 * Utility function to handle onboarding redirects
 * Can be used by other hooks that need to redirect to onboarding
 */
export function redirectToOnboarding(
  router: ReturnType<typeof useRouter>,
  options?: { skipRedirect?: boolean; clearBrandCookie?: boolean }
) {
  if (options?.skipRedirect) return;

  // Clear brand cookie if requested (default true for onboarding)
  if (options?.clearBrandCookie !== false && typeof document !== "undefined") {
    document.cookie = "brand_id=; Max-Age=0; path=/";
  }

  // Ensure client-side before navigating
  if (typeof window !== "undefined") {
    router.push("/onboarding");
  }
}
