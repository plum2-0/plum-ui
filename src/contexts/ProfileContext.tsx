"use client";

import React, { createContext, useContext, ReactNode } from "react";
import type { ProspectProfile } from "@/hooks/api/useProspectProfilesQuery";

interface ProfileContextType {
  selectedProfile: ProspectProfile | null;
  activeConvoId: string | null;
  prospectProfileId: string | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
  selectedProfile: ProspectProfile | null;
}

export function ProfileProvider({
  children,
  selectedProfile,
}: ProfileProviderProps) {
  // Extract active conversation ID and profile ID from selected profile
  const activeConvoId = selectedProfile?.active_convos?.[0]?.id || null;
  const prospectProfileId = selectedProfile?.id || null;

  return (
    <ProfileContext.Provider
      value={{
        selectedProfile,
        activeConvoId,
        prospectProfileId,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
