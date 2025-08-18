"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Prospect } from "@/types/brand";
import DashboardSidebar from "@/components/dashboard2/DashboardSidebar";
import { useBrandQuery, useGenerateUseCaseInsight } from "@/hooks/api/useBrandQuery";

export default function DashboardPage() {
  useSession();
  const router = useRouter();
  const { data: brandResponse, isLoading, error, refetch } = useBrandQuery();
  const generateInsight = useGenerateUseCaseInsight();
  const [onlyUnread, setOnlyUnread] = useState(false);

  const brandData = brandResponse?.brand || null;

  const handleUseCaseSelect = (useCase: Prospect | null) => {
    if (useCase) {
      router.push(`/dashboard/use-case/${useCase.id}`);
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

  if (isLoading) {
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
    <div className="h-full flex overflow-hidden">
      <DashboardSidebar
        brandName={brandData.name}
        prospects={brandData.prospects}
        selectedUseCase={null}
        onUseCaseSelect={handleUseCaseSelect}
        onlyUnread={onlyUnread}
        setOnlyUnread={setOnlyUnread}
        onAddUseCase={handleAddUseCase}
      />

      <main className="flex-1 min-h-0 overflow-y-auto w-full">
        <div className="p-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <h1 className="text-white font-heading text-4xl font-bold">
                Welcome to Your Dashboard
              </h1>
              <p className="text-white/60 font-body text-lg">
                Select a use case from the sidebar to get started.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}