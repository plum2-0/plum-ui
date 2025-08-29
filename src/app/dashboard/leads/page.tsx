"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Prospect } from "@/types/brand";
import {
  useBrandQuery,
  useGenerateUseCaseInsight,
} from "@/hooks/api/useBrandQuery";
import { useAgents } from "@/hooks/api/useAgentQueries";
import { ProspectProfilesInbox } from "@/components/dashboard/ProspectProfilesInbox";
import { ProspectProfileDetail } from "@/components/dashboard/ProspectProfileDetail";
import type { ProspectProfile } from "@/hooks/api/useProspectProfilesQuery";
import { useProspectProfilesQuery } from "@/hooks/api/useProspectProfilesQuery";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { ReplyProvider } from "@/contexts/ReplyContext";
import { useProspectProfileDetailQuery } from "@/hooks/api/useProspectProfileDetailQuery";
import { PlumSproutLoader } from "@/components/ui/PlumSproutLoader";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: brandResponse, isLoading, error, refetch } = useBrandQuery();
  const generateInsight = useGenerateUseCaseInsight();
  const [selectedProfile, setSelectedProfile] =
    useState<ProspectProfile | null>(null);

  // Debug logging
  console.log("🎯 [EngagePage] Session status:", status);
  console.log("🎯 [EngagePage] Session data:", session);
  console.log("🎯 [EngagePage] BrandId from session:", session?.user?.brandId);
  console.log("🎯 [EngagePage] Brand response:", brandResponse);
  console.log("🎯 [EngagePage] Brand loading:", isLoading);

  // Fetch agents for the reply component
  const { data: agentsData, isLoading: isLoadingAgents } = useAgents();

  // Fetch prospect profiles
  const { data: prospectProfiles, isLoading: isLoadingProfiles, error: profilesError } = useProspectProfilesQuery();
  
  console.log("🎯 [EngagePage] Prospect profiles data:", prospectProfiles);
  console.log("🎯 [EngagePage] Prospect profiles loading:", isLoadingProfiles);
  console.log("🎯 [EngagePage] Prospect profiles error:", profilesError);

  // Fetch detailed profile data with active conversation
  const { data: detailedProfile, isLoading: isLoadingProfile } =
    useProspectProfileDetailQuery({
      profileId: selectedProfile?.id,
      enabled: !!selectedProfile?.id,
    });

  useEffect(() => {
    setSelectedProfile(prospectProfiles?.[0] || null);
  }, [prospectProfiles]);

  // Auto-select first profile if none is selected
  useEffect(() => {
    if (!selectedProfile && prospectProfiles && prospectProfiles.length > 0) {
      setSelectedProfile(prospectProfiles[0]);
    }
  }, [selectedProfile, prospectProfiles]);

  const brandData = brandResponse?.brand || null;

  // Handle reply success - auto-select next profile
  const handleReplySuccess = () => {
    if (!prospectProfiles || prospectProfiles.length === 0) return;
    
    const currentIndex = prospectProfiles.findIndex(p => p.id === selectedProfile?.id);
    if (currentIndex !== undefined && currentIndex !== -1 && currentIndex < prospectProfiles.length - 1) {
      // Select the next profile in the list
      setSelectedProfile(prospectProfiles[currentIndex + 1]);
    } else if (currentIndex === prospectProfiles.length - 1) {
      // We're at the last profile, optionally could loop back to first
      // For now, just stay on the current profile
      console.log("You've replied to the last profile in the inbox");
    }
  };

  const handleAddUseCase = async (title: string) => {
    if (!brandData) return Promise.resolve();

    const brandId = brandData.id;

    try {
      await generateInsight.mutateAsync({ brandId, title });

      const updatedBrand = await refetch();
      if (updatedBrand.data?.brand) {
        const created = updatedBrand.data.brand.prospects?.find(
          (prospect) =>
            prospect.problem_to_solve.trim().toLowerCase() ===
            title.trim().toLowerCase()
        );
        if (created) {
          router.push(`/dashboard/use-case/${created.id}`);
        }
      }
    } catch (e) {
      console.error(e);
    }

    return Promise.resolve();
  };

  // Show loading state while session or brand data is loading
  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-white text-xl font-body">
          Loading brand data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-300 text-xl font-body">
          Error: {error.message}
        </div>
      </div>
    );
  }

  if (!brandData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl font-body">No brand data found</div>
      </div>
    );
  }

  return (
    <ProfileProvider selectedProfile={detailedProfile || null}>
      <ReplyProvider onReplySuccess={handleReplySuccess}>
        <main className="flex-1 flex min-h-0 h-full overflow-hidden">
              {/* Prospect Profiles Inbox - 30% width */}
              <div className="w-[30%] min-w-[320px] border-r border-white/10 h-full">
                <ProspectProfilesInbox
                  onProfileSelect={setSelectedProfile}
                  selectedProfileId={selectedProfile?.id}
                />
              </div>

              {/* Detail View - 70% width */}
              <div className="flex-1 h-full">
                {detailedProfile ? (
                  <ProspectProfileDetail
                    profile={detailedProfile}
                    onClose={() => setSelectedProfile(null)}
                    agents={agentsData?.agents || []}
                    isLoadingAgents={isLoadingAgents}
                    setSelectedProfile={setSelectedProfile}
                    isLoadingProfile={isLoadingProfile}
                  />
                ) : selectedProfile && isLoadingProfile ? (
                  <div className="flex items-center justify-center h-full">
                    <PlumSproutLoader show={true} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-white/60 text-xl font-body">
                      No prospect profile selected
                    </div>
                  </div>
                )}
              </div>
        </main>
      </ReplyProvider>
    </ProfileProvider>
  );
}