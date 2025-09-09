"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { BRAND_QUERY_KEYS } from "@/hooks/api/useBrandQuery";

export default function InviteClient({ token }: { token: string }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<any>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const res = await fetch(`/api/invites/${token}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load invite");
        }
        const data = await res.json();
        setInvite(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load invite");
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, [token]);

  const acceptInvite = useCallback(
    async (retries = 5, delayMs = 300): Promise<void> => {
      try {
        console.log("[CLIENT_DEBUG] Starting acceptInvite");
        console.log("[CLIENT_DEBUG] Current session:", {
          hasSession: !!session,
          userId: (session as any)?.user?.id,
          email: session?.user?.email,
          status,
        });

        setIsAccepting(true);
        const res = await fetch(`/api/invites/${token}`, { method: "POST" });
        const data = await res.json().catch(() => ({}));
        console.log("[CLIENT_DEBUG] Invite API response:", {
          status: res.status,
          ok: res.ok,
          data,
        });

        if (!res.ok) {
          throw new Error(
            data?.error || `Failed to accept invite (${res.status})`
          );
        }

        // Force NextAuth session update to refresh the JWT token with new brandId
        if (update) {
          console.log("[CLIENT_DEBUG] Calling session update");
          await update();
          console.log("[CLIENT_DEBUG] Session update complete");
        }

        // Invalidate React Query cache to prevent stale brand data
        console.log("[CLIENT_DEBUG] Invalidating brand query cache");
        queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.all });
        queryClient.removeQueries({ queryKey: BRAND_QUERY_KEYS.all });
        
        // Also clear any cached user context data to force a fresh fetch
        queryClient.invalidateQueries({ queryKey: ['userContext'] });
        queryClient.removeQueries({ queryKey: ['userContext'] });
        
        // Clear all brand-related queries completely
        queryClient.clear();

        // Wait until /api/user/brand reflects the new brand, then navigate
        const maxWaitMs = 4000;
        const start = Date.now();
        while (Date.now() - start < maxWaitMs) {
          try {
            const brandRes = await fetch("/api/user/brand", {
              cache: "no-store",
              headers: {
                "Cache-Control": "no-cache",
              },
            });
            if (brandRes.ok) {
              const brandData = await brandRes.json();
              console.log("[CLIENT_DEBUG] Brand check:", {
                brandId: brandData?.brandId,
                source: brandData?.source,
                elapsed: Date.now() - start,
              });
              // Accept either Firestore-confirmed brand or cookie/session source if present
              if (
                brandData?.brandId &&
                ["firestore", "cookie", "session"].includes(brandData?.source)
              ) {
                console.log(
                  "[CLIENT_DEBUG] Brand confirmed, navigating to dashboard"
                );
                router.replace("/dashboard/discover");
                return;
              }
            }
          } catch {}
          await new Promise((r) => setTimeout(r, 500));
        }

        // If we couldn't confirm via API, still navigate since the invite was accepted
        console.log(
          "[CLIENT_DEBUG] Timeout waiting for brand confirmation, navigating anyway"
        );
        router.replace("/dashboard/discover");
      } catch (e: any) {
        if (retries > 0) {
          // Small backoff to allow auth session/id to settle
          await new Promise((r) => setTimeout(r, delayMs));
          return acceptInvite(retries - 1, Math.min(delayMs * 2, 1500));
        }
        setError(e?.message || "Failed to accept invite");
        setIsAccepting(false);
      }
    },
    [router, token, update, queryClient]
  );

  // Auto-accept invite when user becomes authenticated
  useEffect(() => {
    if (status === "authenticated" && invite && !error) {
      // Extra guard: ensure we have a user id in session before proceeding
      const hasUserId = Boolean((session as any)?.user?.id);
      const timer = setTimeout(() => {
        if (hasUserId) acceptInvite();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [status, invite, error, session, acceptInvite]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <div>Loading invite...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg text-white max-w-lg text-center">
          <div className="text-red-300 mb-2">{error}</div>
          <button
            className="mt-2 px-4 py-2 rounded bg-purple-600 hover:bg-purple-700"
            onClick={() => router.replace("/dashboard/discover")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const requiresAuth = status !== "authenticated";

  if (isAccepting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <div>Accepting your invite...</div>
        </div>
      </div>
    );
  }

  // Use a relative, same-origin callback URL to ensure NextAuth returns here after sign-in
  const relativeCallbackUrl = `/invite/${token}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg text-white max-w-xl w-full">
        <h1 className="text-2xl font-semibold mb-2">
          Join {invite?.brandName || "this brand"}
        </h1>
        <p className="text-purple-200 mb-6">
          You have been invited to collaborate. Accepting will link your account
          to this brand.
        </p>
        {requiresAuth ? (
          <a
            href={`/auth/signin?callbackUrl=${encodeURIComponent(
              relativeCallbackUrl
            )}`}
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 inline-block"
            onClick={() => {
              // Set a short-lived cookie so post-auth we can resume invite flow from home or any landing
              if (typeof document !== "undefined") {
                document.cookie = `pending_invite_path=${encodeURIComponent(
                  relativeCallbackUrl
                )}; Max-Age=900; path=/`; // 15 minutes
              }
            }}
          >
            Sign in to Accept
          </a>
        ) : (
          <button
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => acceptInvite()}
            disabled={isAccepting}
          >
            {isAccepting ? "Accepting..." : "Accept Invite"}
          </button>
        )}
      </div>
    </div>
  );
}
