"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { Brand } from "@/types/brand";

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
  const [userBrands, setUserBrands] = useState<Brand[]>([]);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize active brand from localStorage or session
  useEffect(() => {
    if (status === "loading") return;

    const initializeActiveBrand = () => {
      // Try localStorage first (user's last selection)
      const savedBrandId = localStorage.getItem("activeBrandId");
      if (savedBrandId) {
        setActiveBrandId(savedBrandId);
        return;
      }

      // Try cookie (from onboarding or legacy)
      const cookies = document.cookie.split("; ");
      const brandIdCookie = cookies.find(cookie => cookie.startsWith("brand_id="));
      if (brandIdCookie) {
        const brandId = brandIdCookie.split("=")[1];
        setActiveBrandId(brandId);
        localStorage.setItem("activeBrandId", brandId);
        return;
      }

      // Fallback to session brandId (legacy)
      if (session?.user?.brandId) {
        setActiveBrandId(session.user.brandId);
        localStorage.setItem("activeBrandId", session.user.brandId);
      }
    };

    initializeActiveBrand();
  }, [session, status]);

  // Fetch user brands when session is ready
  const fetchUserBrands = async (): Promise<void> => {
    if (!session?.user?.id) {
      setUserBrands([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

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
          // User has no brands yet
          setUserBrands([]);
          setActiveBrandId(null);
          setIsLoading(false);
          return;
        }
        throw new Error(`Failed to fetch user brands: ${brandIdsResponse.statusText}`);
      }

      const brandIdsData = await brandIdsResponse.json();
      const brandIds: string[] = brandIdsData.brand_ids || [];

      if (brandIds.length === 0) {
        setUserBrands([]);
        setActiveBrandId(null);
        setIsLoading(false);
        return;
      }

      // Fetch full brand data for each brand
      const brandPromises = brandIds.map(async (brandId) => {
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

        return response.json();
      });

      const brands = await Promise.all(brandPromises);
      const validBrands = brands.filter((brand): brand is Brand => brand !== null);
      
      setUserBrands(validBrands);

      // Set active brand if not already set
      if (!activeBrandId && validBrands.length > 0) {
        const firstBrandId = validBrands[0].id;
        setActiveBrandId(firstBrandId);
        localStorage.setItem("activeBrandId", firstBrandId);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching user brands:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch user brands");
      setIsLoading(false);
    }
  };

  // Fetch brands when session is ready
  useEffect(() => {
    if (status === "authenticated") {
      fetchUserBrands();
    } else if (status === "unauthenticated") {
      setUserBrands([]);
      setActiveBrandId(null);
      setIsLoading(false);
    }
  }, [session, status]);

  // Switch active brand
  const switchActiveBrand = (brandId: string) => {
    // Validate that the brand exists in user's brands
    const brandExists = userBrands.some(brand => brand.id === brandId);
    if (!brandExists) {
      console.error(`Attempted to switch to non-existent brand: ${brandId}`);
      return;
    }

    setActiveBrandId(brandId);
    localStorage.setItem("activeBrandId", brandId);

    // Update cookie for backward compatibility
    document.cookie = `brand_id=${brandId}; Max-Age=${7 * 24 * 60 * 60}; path=/`;
  };

  // Refresh user brands
  const refreshUserBrands = async () => {
    await fetchUserBrands();
  };

  const contextValue: UserContextType = {
    userBrands,
    activeBrandId,
    switchActiveBrand,
    isLoading,
    error,
    refreshUserBrands,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}