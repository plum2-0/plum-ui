import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface OnboardingState {
  currentStep: 1 | 2 | 3 | 4;
  hasProject: boolean;
  projectId: string | null;
  projectName: string | null;
  hasRedditConfig: boolean;
  hasCompleteConfig: boolean;
  redirectTo: "/onboarding" | "/onboarding/reddit" | "/onboarding/configure" | string;
}

interface UseOnboardingStateReturn {
  state: OnboardingState | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOnboardingState(autoRedirect: boolean = true): UseOnboardingStateReturn {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/onboarding/state");
      
      if (!response.ok) {
        throw new Error("Failed to fetch onboarding state");
      }

      const data: OnboardingState = await response.json();
      setState(data);

      // Store project info in localStorage if we have it
      if (data.projectId && data.projectName) {
        const existingData = localStorage.getItem("onboardingData");
        const onboardingData = existingData ? JSON.parse(existingData) : {};
        
        localStorage.setItem(
          "onboardingData",
          JSON.stringify({
            ...onboardingData,
            projectId: data.projectId,
            projectName: data.projectName,
          })
        );
      }

      // Auto redirect if enabled and we're not already on the correct page
      if (autoRedirect && typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        
        // Don't redirect if we just completed a Reddit connection
        const justConnectedReddit = urlParams.has('reddit') && urlParams.get('reddit') === 'connected';
        
        // Don't redirect if there's an error parameter (user needs to see the error)
        const hasError = urlParams.has('error');
        
        // Check if we've recently redirected to prevent loops
        const lastRedirect = sessionStorage.getItem('lastOnboardingRedirect');
        const lastRedirectTime = sessionStorage.getItem('lastOnboardingRedirectTime');
        const now = Date.now();
        const recentlyRedirected = lastRedirect === data.redirectTo && 
                                  lastRedirectTime && 
                                  (now - parseInt(lastRedirectTime)) < 2000; // 2 seconds
        
        // Only redirect if we're on a different onboarding page than we should be
        // But don't redirect if we're already on the target page to prevent loops
        // Also handle redirects to the review page when config is complete
        const shouldRedirect = (
          (currentPath.startsWith("/onboarding") && currentPath !== data.redirectTo) ||
          (data.hasCompleteConfig && !currentPath.startsWith("/projects"))
        );
        
        if (shouldRedirect &&
            !justConnectedReddit &&
            !hasError &&
            !recentlyRedirected &&
            // Don't redirect from reddit page if already connected (allow viewing)
            !(currentPath === "/onboarding/reddit" && data.hasRedditConfig)) {
          
          // Store redirect info to prevent loops
          sessionStorage.setItem('lastOnboardingRedirect', data.redirectTo);
          sessionStorage.setItem('lastOnboardingRedirectTime', now.toString());
          
          router.push(data.redirectTo);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check onboarding state");
      setState(null);
    } finally {
      setLoading(false);
    }
  }, [router, autoRedirect]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  return {
    state,
    loading,
    error,
    refetch: fetchState,
  };
}