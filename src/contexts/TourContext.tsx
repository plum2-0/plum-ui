"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface TourContextType {
  hasSeenTour: boolean;
  shouldShowTour: boolean;
  startTour: () => void;
  completeTour: () => void;
  resetTour: () => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_STORAGE_KEY = "plum_app_tour_completed";

export function TourProvider({ children }: { children: ReactNode }) {
  const [hasSeenTour, setHasSeenTour] = useState(true); // Default to true until we check localStorage
  const [shouldShowTour, setShouldShowTour] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour before
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    const hasSeen = tourCompleted === "true";
    setHasSeenTour(hasSeen);
    // Don't auto-show tour here - let the DiscoverPage handle it
  }, []);

  const startTour = () => {
    setShouldShowTour(true);
    setIsActive(true);
  };

  const completeTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setHasSeenTour(true);
    setShouldShowTour(false);
    setIsActive(false);
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setHasSeenTour(false);
    setShouldShowTour(true);
    setIsActive(true);
  };

  return (
    <TourContext.Provider
      value={{
        hasSeenTour,
        shouldShowTour,
        startTour,
        completeTour,
        resetTour,
        isActive,
        setIsActive,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useAppTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useAppTour must be used within a TourProvider");
  }
  return context;
}