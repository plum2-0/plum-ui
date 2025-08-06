"use client";

import { useState, useEffect } from "react";
import { PlumLogo } from "@/components/PlumLogo";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Brand, UseCase } from "@/types/brand";
import UseCasesSidebar from "@/components/dashboard2/UseCasesSidebar";
import CompetitorSummary from "@/components/dashboard2/CompetitorSummary";
import RedditPostListItem from "@/components/dashboard2/RedditPostListItem";

export default function Dashboard2Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [brandData, setBrandData] = useState<Brand | null>(null);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Load brand data from API
  useEffect(() => {
    const loadBrandData = async () => {
      try {
        const response = await fetch("/api/brand");

        if (!response.ok) {
          const errorData = await response.json();

          // If user needs onboarding, redirect them
          if (errorData.needsOnboarding) {
            router.push("/onboarding");
            return;
          }

          throw new Error(errorData.error || "Failed to fetch brand data");
        }

        const result = await response.json();
        const data: Brand = result.brand;

        setBrandData(data);

        // Select first use case by default
        if (data.target_use_cases.length > 0) {
          setSelectedUseCase(data.target_use_cases[0]);
        }
      } catch (error) {
        console.error("Error loading brand data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load brand data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      loadBrandData();
    }
  }, [session, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-300 text-xl mb-4">
            Error loading brand data
          </div>
          <div className="text-white/80 mb-6">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!brandData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white">No data available</div>
      </div>
    );
  }

  const filteredPosts = selectedUseCase?.subreddit_posts || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="p-6 bg-white/10 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlumLogo />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm">
              Welcome, {session?.user?.name || session?.user?.email}
            </span>
            <Link
              href="/api/auth/signout"
              className="text-white/60 hover:text-white text-sm"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <UseCasesSidebar
          useCases={brandData.target_use_cases}
          selectedUseCase={selectedUseCase}
          onUseCaseSelect={setSelectedUseCase}
          onlyUnread={onlyUnread}
          setOnlyUnread={setOnlyUnread}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Competitor Summary */}
            {selectedUseCase?.competitor_summary && (
              <CompetitorSummary
                summary={selectedUseCase.competitor_summary}
                hotFeatures={selectedUseCase.hot_features_summary}
              />
            )}

            {/* Reddit Posts */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
                  <p className="text-purple-200">
                    No posts found for this use case.
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <RedditPostListItem key={post.id} post={post} />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
