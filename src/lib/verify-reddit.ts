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

export async function verifyRedditAccount(): Promise<VerifyResponse> {
  const res = await fetch("/api/reddit/verify", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const data = await res.json();
  if (res.ok) {
    return { ok: true, ...data } as VerifyResponseOk;
  }
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
  }
  return false;
}
