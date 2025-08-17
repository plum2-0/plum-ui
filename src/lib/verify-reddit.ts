export interface VerifyResponseOk {
  ok: true;
  brandId: string;
  reddit?: {
    username?: string;
    expiresAt?: number;
  } | null;
}

export interface VerifyResponseErr {
  ok: false;
  error: string;
  message: string;
  status: number;
  needsOnboarding?: boolean;
  needsRedditAuth?: boolean;
}

export type VerifyResponse = VerifyResponseOk | VerifyResponseErr;

const REDDIT_AUTH_CACHE_KEY = "reddit-auth-verified";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function verifyRedditAccount(): Promise<VerifyResponse> {
  // Check sessionStorage cache first
  const cachedAuth = sessionStorage.getItem(REDDIT_AUTH_CACHE_KEY);
  if (cachedAuth) {
    try {
      const cached = JSON.parse(cachedAuth);
      // Check if cache is still valid (within 5 minutes)
      if (cached.timestamp && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data as VerifyResponseOk;
      }
      // Cache expired, remove it
      sessionStorage.removeItem(REDDIT_AUTH_CACHE_KEY);
    } catch (e) {
      // Invalid cache, remove it
      sessionStorage.removeItem(REDDIT_AUTH_CACHE_KEY);
    }
  }

  const res = await fetch("/api/reddit/verify", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const data = await res.json();
  if (res.ok) {
    const response = { ok: true, ...data } as VerifyResponseOk;
    // Cache successful verification
    sessionStorage.setItem(
      REDDIT_AUTH_CACHE_KEY,
      JSON.stringify({
        data: response,
        timestamp: Date.now(),
      })
    );
    return response;
  }
  
  // Clear cache on auth failure
  sessionStorage.removeItem(REDDIT_AUTH_CACHE_KEY);
  
  return {
    ok: false,
    status: res.status,
    error: data?.error || "UNKNOWN_ERROR",
    message: data?.message || "Verification failed",
    needsOnboarding: data?.needsOnboarding,
    needsRedditAuth: data?.needsRedditAuth,
  } as VerifyResponseErr;
}

export async function redirectToRedditConnect(): Promise<never> {
  const res = await fetch("/api/connections/reddit/connect", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get Reddit auth URL: ${text}`);
  }

  const { authUrl } = (await res.json()) as { authUrl: string };
  // Redirect browser to Reddit OAuth
  window.location.href = authUrl;
  // Inform TypeScript that execution never continues here
  throw new Error("Redirecting to Reddit OAuth");
}

export async function ensureRedditConnectedOrRedirect(): Promise<boolean> {
  const result = await verifyRedditAccount();
  if (result.ok) return true;
  if ((result as VerifyResponseErr).needsRedditAuth) {
    await redirectToRedditConnect();
    return true
  }
  return false;
}

// Helper function to clear Reddit auth cache (call this on signout)
export function clearRedditAuthCache(): void {
  sessionStorage.removeItem(REDDIT_AUTH_CACHE_KEY);
}
