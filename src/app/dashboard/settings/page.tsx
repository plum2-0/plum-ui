"use client";

import { useQueryClient } from "@tanstack/react-query";
import BrandSettings from "@/components/settings/BrandSettings";
import TeamAgentList from "@/components/team/TeamAgentList";
import { useBrandQuery, BRAND_QUERY_KEY } from "@/hooks/api/useBrandQuery";
import { Brand } from "@/types/brand";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useBrandQuery();

  const handleBrandUpdate = (updatedBrand: Brand) => {
    queryClient.setQueryData(BRAND_QUERY_KEY, { brand: updatedBrand });
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
        <div className="text-red-400 font-body">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-white mb-2">
          Settings
        </h1>
        <p className="text-white/60 font-body">
          Manage your brand identity, team agents, and social media integrations
        </p>
      </div>

      {/* Brand Settings */}
      <div className="glass-card rounded-xl p-6">
        <BrandSettings
          brand={data?.brand || null}
          onUpdate={handleBrandUpdate}
        />
      </div>

      {/* Team Management */}
      <div className="glass-card rounded-xl p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-white mb-2">
            Team Management
          </h2>
          <p className="text-white/60 font-body">
            Manage your AI agents that engage with communities on your behalf
          </p>
        </div>
        <TeamAgentList />
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
