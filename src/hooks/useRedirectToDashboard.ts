"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Redirects the user to the dashboard if they already have a brand.
 * Intended for use on pages like onboarding or sign-in where users
 * with an existing brand should skip forward to the dashboard.
 */
export function useRedirectToDashboard(): void {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (hasRedirectedRef.current) return;
    if (status === "loading") return;
    if (!session?.user) return;

    let isCancelled = false;

    const checkBrandAndRedirect = async () => {
      try {
        const response = await fetch("/api/user/brand", { cache: "no-store" });
        if (!response.ok) return; // If the endpoint errors, do nothing

        const data = (await response.json()) as { brandId: string | null };
        if (data?.brandId && typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith("/dashboard") && !isCancelled) {
            hasRedirectedRef.current = true;
            router.push("/dashboard/discover");
          }
        }
      } catch {
        // Swallow errors; absence of brand or network issues should not break the page
      }
    };

    checkBrandAndRedirect();

    return () => {
      isCancelled = true;
    };
  }, [session, status, router]);
}

