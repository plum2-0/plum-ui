"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { Brand } from "@/types/brand";
import { useBrandQuery } from "@/hooks/api/useBrandQuery";

interface BrandContextType {
  brand: Brand | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error, refetch } = useBrandQuery();
  
  return (
    <BrandContext.Provider
      value={{
        brand: data?.brand || null,
        isLoading,
        error,
        refetch,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}