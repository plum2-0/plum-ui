"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Brand } from "@/types/brand";
import { BRAND_QUERY_KEYS } from "@/hooks/api/useBrandQuery";

interface UserContextType {
  userBrands: Brand[];
  activeBrandId: string | null;
  switchActiveBrand: (brandId: string) => void;
  isLoading: boolean;
  error: string | null;
  refreshUserBrands: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function UserProvider({ children }: UserProviderProps) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  
  // OPTIMIZED: Get initial active brand from storage
  const getInitialActiveBrand = (): string | null => {
    if (typeof window === "undefined") return null;
    
    // Try localStorage first (user's last selection)
    const savedBrandId = localStorage.getItem("activeBrandId");
    if (savedBrandId) return savedBrandId;

    // Try cookie (from onboarding or legacy)
    const cookies = document.cookie.split("; ");
    const brandIdCookie = cookies.find(cookie => cookie.startsWith("brand_id="));
    if (brandIdCookie) {
      const brandId = brandIdCookie.split("=")[1];
      localStorage.setItem("activeBrandId", brandId);
      return brandId;
    }

    // Fallback to session brandId (legacy)
    if (session?.user?.brandId) {
      localStorage.setItem("activeBrandId", session.user.brandId);
      return session.user.brandId;
    }
    
    return null;
  };

  // OPTIMIZED: Use React Query for user brands fetching with proper caching
  const userBrandsQuery = useQuery({
    queryKey: session?.user?.id ? BRAND_QUERY_KEYS.allByUser(session.user.id) : ["user-brands-disabled"],
    queryFn: async (): Promise<Brand[]> => {
      if (!session?.user?.id) return [];

      // Fetch all brand IDs for the user
      const brandIdsResponse = await fetch(`${API_BASE_URL}/api/brand/by-user/${session.user.id}/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Plum-UI/1.0",
        },
      });

      if (!brandIdsResponse.ok) {
        if (brandIdsResponse.status === 404) {
          return []; // User has no brands yet
        }
        throw new Error(`Failed to fetch user brands: ${brandIdsResponse.statusText}`);
      }

      const brandIdsData = await brandIdsResponse.json();
      const brandIds: string[] = brandIdsData.brand_ids || [];

      if (brandIds.length === 0) return [];

      // OPTIMIZATION: Check cache first for individual brands to avoid redundant requests
      const brandPromises = brandIds.map(async (brandId) => {
        // Try to get from React Query cache first
        const cachedBrand = queryClient.getQueryData(BRAND_QUERY_KEYS.detail(brandId)) as { brand: Brand } | undefined;
        if (cachedBrand?.brand) {
          return cachedBrand.brand;
        }

        // Fetch if not in cache
        const response = await fetch(`${API_BASE_URL}/api/brand/${brandId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Plum-UI/1.0",
          },
        });

        if (!response.ok) {
          console.warn(`Failed to fetch brand ${brandId}: ${response.statusText}`);
          return null;
        }

        const brandData = await response.json();
        
        // OPTIMIZATION: Cache individual brand data for future use
        queryClient.setQueryData(BRAND_QUERY_KEYS.detail(brandId), { brand: brandData });
        
        return brandData;
      });

      const brands = await Promise.all(brandPromises);
      return brands.filter((brand): brand is Brand => brand !== null);
    },
    enabled: status === "authenticated" && !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // OPTIMIZATION: Don't refetch on mount if cached
  });

  const userBrands = userBrandsQuery.data || [];
  
  // REACTIVE: Use state for activeBrandId to make it reactive to changes
  const [activeBrandId, setActiveBrandId] = useState<string | null>(() => 
    getInitialActiveBrand()
  );

  // REACTIVE: Update activeBrandId when localStorage changes or userBrands load
  useEffect(() => {
    const currentStoredBrandId = getInitialActiveBrand();
    
    // If we have a stored brand ID, use it
    if (currentStoredBrandId) {
      setActiveBrandId(currentStoredBrandId);
    } 
    // If no stored brand but we have brands loaded, use the first one
    else if (userBrands.length > 0 && !currentStoredBrandId) {
      const firstBrandId = userBrands[0].id;
      setActiveBrandId(firstBrandId);
      if (typeof window !== "undefined") {
        localStorage.setItem("activeBrandId", firstBrandId);
      }
    }
  }, [userBrands]);

  // Switch active brand
  const switchActiveBrand = (brandId: string) => {
    // Validate that the brand exists in user's brands
    const brandExists = userBrands.some(brand => brand.id === brandId);
    if (!brandExists) {
      console.error(`Attempted to switch to non-existent brand: ${brandId}`);
      return;
    }

    // REACTIVE: Update React state immediately for UI responsiveness
    setActiveBrandId(brandId);

    if (typeof window !== "undefined") {
      localStorage.setItem("activeBrandId", brandId);
      // Update cookie for backward compatibility
      document.cookie = `brand_id=${brandId}; Max-Age=${7 * 24 * 60 * 60}; path=/`;
    }
    
    // OPTIMIZATION: Invalidate related queries to trigger re-renders
    queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.all });
  };

  // Refresh user brands
  const refreshUserBrands = async () => {
    await userBrandsQuery.refetch();
  };

  const contextValue: UserContextType = {
    userBrands,
    activeBrandId,
    switchActiveBrand,
    isLoading: userBrandsQuery.isLoading || status === "loading",
    error: userBrandsQuery.error ? String(userBrandsQuery.error) : null,
    refreshUserBrands,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}