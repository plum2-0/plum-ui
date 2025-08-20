import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { ProspectProfile } from "./useProspectProfilesQuery";

export const PROSPECT_PROFILE_DETAIL_QUERY_KEY = [
  "prospect-profile-detail",
] as const;

interface UseProspectProfileDetailQueryProps {
  profileId: string | undefined;
  enabled?: boolean;
}

export function useProspectProfileDetailQuery({
  profileId,
  enabled = true,
}: UseProspectProfileDetailQueryProps) {
  const { data: session } = useSession();

  return useQuery<ProspectProfile>({
    queryKey: [
      ...PROSPECT_PROFILE_DETAIL_QUERY_KEY,
      session?.user?.brandId,
      profileId,
    ],
    queryFn: async () => {
      const brandId = session?.user?.brandId;
      if (!brandId) throw new Error("No brand ID available");
      if (!profileId) throw new Error("No profile ID provided");

      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${backendUrl}/api/brand/${brandId}/prospect/profiles/${profileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Plum-UI/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch prospect profile detail: ${response.statusText}`
        );
      }
      return response.json();
    },
    enabled: !!session?.user?.brandId && !!profileId && enabled,
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus for detail view
  });
}
