"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import BrandSettings from "@/components/settings/BrandSettings";
import SocialMediaManager from "@/components/settings/SocialMediaManager";
import { Brand } from "@/types/brand";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState<"brand" | "social">("brand");
  const [brandData, setBrandData] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBrandData = async () => {
      try {
        const response = await fetch("/api/brand");
        if (!response.ok) {
          throw new Error("Failed to fetch brand data");
        }
        const result = await response.json();
        setBrandData(result.brand);
      } catch (error) {
        console.error("Error loading brand data:", error);
        setError(error instanceof Error ? error.message : "Failed to load brand data");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      loadBrandData();
    }
  }, [session]);

  const handleBrandUpdate = (updatedBrand: Brand) => {
    setBrandData(updatedBrand);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-white text-xl font-body">
          Loading brand settings...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400 font-body">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-white mb-2">
          Settings
        </h1>
        <p className="text-white/60 font-body">
          Manage your brand identity and social media integrations
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveSection("brand")}
          className={`px-4 py-2 rounded-lg font-body transition-all ${
            activeSection === "brand"
              ? "glass-card text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          Brand Information
        </button>
        <button
          onClick={() => setActiveSection("social")}
          className={`px-4 py-2 rounded-lg font-body transition-all ${
            activeSection === "social"
              ? "glass-card text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          Social Media
        </button>
      </div>

      <div className="glass-card rounded-xl p-6">
        {activeSection === "brand" ? (
          <BrandSettings brand={brandData} onUpdate={handleBrandUpdate} />
        ) : (
          <SocialMediaManager brand={brandData} onUpdate={handleBrandUpdate} />
        )}
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}