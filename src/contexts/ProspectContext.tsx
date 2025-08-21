"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Prospect } from "@/types/brand";

interface ProspectContextType {
  selectedProspect: Prospect | null;
  setSelectedProspect: (prospect: Prospect | null) => void;
}

const ProspectContext = createContext<ProspectContextType | undefined>(
  undefined
);

export function ProspectProvider({ children }: { children: ReactNode }) {
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(
    null
  );

  return (
    <ProspectContext.Provider value={{ selectedProspect, setSelectedProspect }}>
      {children}
    </ProspectContext.Provider>
  );
}

export function useProspect() {
  const context = useContext(ProspectContext);
  if (context === undefined) {
    throw new Error("useProspect must be used within a ProspectProvider");
  }
  return context;
}