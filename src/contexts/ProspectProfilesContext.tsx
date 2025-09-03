"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface ProspectProfilesContextType {
  currentProfileId: string | null;
  activeReplyBoxes: Map<string, boolean>;
  openReplyBox: (profileId: string, postId: string) => void;
  closeReplyBox: (profileId: string, postId: string) => void;
  isReplyBoxOpen: (profileId: string, postId: string) => boolean;
  clearAllReplyBoxes: () => void;
  resetProfileState: (profileId: string) => void;
}

const ProspectProfilesContext = createContext<ProspectProfilesContextType | undefined>(undefined);

interface ProspectProfilesProviderProps {
  children: ReactNode;
  currentProfileId: string | null;
}

export function ProspectProfilesProvider({ 
  children, 
  currentProfileId 
}: ProspectProfilesProviderProps) {
  const [previousProfileId, setPreviousProfileId] = useState<string | null>(currentProfileId);
  const [activeReplyBoxes, setActiveReplyBoxes] = useState<Map<string, boolean>>(new Map());

  const clearAllReplyBoxes = useCallback(() => {
    setActiveReplyBoxes(new Map());
  }, []);

  // Clear reply boxes when profile changes
  useEffect(() => {
    if (currentProfileId !== previousProfileId) {
      console.log(`Profile changed from ${previousProfileId} to ${currentProfileId}, clearing reply boxes`);
      clearAllReplyBoxes();
      setPreviousProfileId(currentProfileId);
    }
  }, [currentProfileId, previousProfileId, clearAllReplyBoxes]);

  const openReplyBox = useCallback((profileId: string, postId: string) => {
    const key = `${profileId}_${postId}`;
    setActiveReplyBoxes(prev => {
      const next = new Map(prev);
      next.set(key, true);
      return next;
    });
  }, []);

  const closeReplyBox = useCallback((profileId: string, postId: string) => {
    const key = `${profileId}_${postId}`;
    setActiveReplyBoxes(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const isReplyBoxOpen = useCallback((profileId: string, postId: string) => {
    const key = `${profileId}_${postId}`;
    return activeReplyBoxes.get(key) || false;
  }, [activeReplyBoxes]);

  const resetProfileState = useCallback((profileId: string) => {
    setActiveReplyBoxes(prev => {
      const next = new Map(prev);
      // Remove all entries for this profile
      for (const key of next.keys()) {
        if (key.startsWith(`${profileId}_`)) {
          next.delete(key);
        }
      }
      return next;
    });
  }, []);

  return (
    <ProspectProfilesContext.Provider
      value={{
        currentProfileId,
        activeReplyBoxes,
        openReplyBox,
        closeReplyBox,
        isReplyBoxOpen,
        clearAllReplyBoxes,
        resetProfileState,
      }}
    >
      {children}
    </ProspectProfilesContext.Provider>
  );
}

export function useProspectProfiles() {
  const context = useContext(ProspectProfilesContext);
  if (context === undefined) {
    throw new Error("useProspectProfiles must be used within a ProspectProfilesProvider");
  }
  return context;
}