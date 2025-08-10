"use client";

import { useState, useEffect } from "react";
import { PlumSproutLogo } from "@/components/PlumSproutLogo";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Brand, UseCase, SubredditPost } from "@/types/brand";
import UseCasesSidebar from "@/components/dashboard2/UseCasesSidebar";
import CompetitorSummary from "@/components/dashboard2/CompetitorSummary";
import RedditPostListItem from "@/components/dashboard2/RedditPostListItem";
import TagFiltersDropdown from "@/components/dashboard2/TagFiltersDropdown";
import UseCaseInsightsComponent from "@/components/dashboard2/UseCaseInsights";
import UseCaseTabs from "@/components/dashboard2/UseCaseTabs";
import InviteTeammateButton from "@/components/InviteTeammateButton";

export default function Dashboard2Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [brandData, setBrandData] = useState<Brand | null>(null);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'posts' | 'insights'>('posts');
  const pageSize = 10;

  // Check authentication
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Load saved filter preferences from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem("dashboardTagFilters");
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        setSelectedTags(new Set(filters));
      } catch (e) {
        console.error("Error loading saved filters:", e);
      }
    }
  }, []);

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

  console.log(JSON.stringify(brandData, null, 2));

  // Reset pagination and tab when changing use case
  useEffect(() => {
    setPage(1);
    setActiveTab('posts'); // Always start with posts tab
  }, [selectedUseCase]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.2), transparent 50%),
              linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
            `
          }}
        />
        <div className="animate-pulse text-white text-xl relative z-10 font-body">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.2), transparent 50%),
              linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
            `
          }}
        />
        <div className="text-red-300 text-xl relative z-10 font-body">Error: {error}</div>
      </div>
    );
  }

  if (!brandData) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.2), transparent 50%),
              linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
            `
          }}
        />
        <div className="text-white text-xl relative z-10 font-body">No brand data found</div>
      </div>
    );
  }

  const allPosts = selectedUseCase?.subreddit_posts || [];

  // Filter posts based on selected tags
  const filteredPosts = allPosts.filter((post: SubredditPost) => {
    if (selectedTags.size === 0) return true;
    
    // Check if any selected tag matches the post's tags
    return Array.from(selectedTags).some(selectedTag => {
      switch (selectedTag) {
        case 'potential_customer':
          return post.tags?.potential_customer;
        case 'competitor_mention':
          return post.tags?.competitor_mention;
        case 'own_mention':
          return post.tags?.own_mention;
        case 'positive_sentiment':
          return post.tags?.positive_sentiment;
        case 'negative_sentiment':
          return post.tags?.negative_sentiment;
        default:
          return false;
      }
    });
  });

  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / pageSize);
  const startIndex = (page - 1) * pageSize;
  const visiblePosts = filteredPosts.slice(startIndex, startIndex + pageSize);

  // Tag handling functions
  const handleTagToggle = (tagName: string) => {
    setSelectedTags((prev) => {
      const newTags = new Set(prev);
      if (newTags.has(tagName)) {
        newTags.delete(tagName);
      } else {
        newTags.add(tagName);
      }
      // Save to localStorage
      localStorage.setItem(
        "dashboardTagFilters",
        JSON.stringify(Array.from(newTags))
      );
      return newTags;
    });
    // Reset to page 1 when filters change
    setPage(1);
  };

  const handleClearAllTags = () => {
    setSelectedTags(new Set());
    localStorage.removeItem("dashboardTagFilters");
    setPage(1);
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background with Liquid Glass Effect */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.2), transparent 50%),
            linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
          `
        }}
      />
      
      {/* Floating Glass Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-30 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.1) 70%, transparent 100%)',
            filter: 'blur(40px)',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute top-40 right-32 w-96 h-96 rounded-full opacity-25 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.1) 70%, transparent 100%)',
            filter: 'blur(50px)',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
        <div 
          className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 70%, transparent 100%)',
            filter: 'blur(30px)',
            animation: 'float 10s ease-in-out infinite'
          }}
        />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        .glass-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(30px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        .glass-button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }
        .glass-button:disabled {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          opacity: 0.5;
        }
      `}</style>

      {/* Fixed Header */}
      <header className="glass-header px-4 py-4 shrink-0 relative z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl glass-card">
              <PlumSproutLogo className="w-6 h-6" />
            </div>
            <span className="font-heading text-lg font-bold text-white tracking-wide">
              PlumSprout
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/80 font-body text-sm">
              Welcome, {session?.user?.name || session?.user?.email}
            </span>
            <InviteTeammateButton brandId={session?.user?.brandId || null} />
            <Link
              href="/api/auth/signout"
              className="text-white/60 hover:text-white font-body text-sm transition-colors"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Fixed Sidebar */}
        <div className="w-64 shrink-0">
          <UseCasesSidebar
            useCases={brandData.target_use_cases}
            selectedUseCase={selectedUseCase}
            onUseCaseSelect={setSelectedUseCase}
            onlyUnread={onlyUnread}
            setOnlyUnread={setOnlyUnread}
          />
        </div>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Use Case Tabs and Filter Controls */}
              {selectedUseCase && (
                <div className="flex items-center justify-between">
                  <UseCaseTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    hasInsights={!!selectedUseCase.insights}
                  />
                  {activeTab === 'posts' && (
                    <TagFiltersDropdown
                      posts={allPosts}
                      selectedTags={selectedTags}
                      onTagToggle={handleTagToggle}
                      onClearAll={handleClearAllTags}
                    />
                  )}
                </div>
              )}

              {/* Insights View */}
              {activeTab === 'insights' && selectedUseCase?.insights && (
                <UseCaseInsightsComponent insights={selectedUseCase.insights} />
              )}

                            {/* Posts View */}
              {activeTab === 'posts' && (
                <>
                  {/* Competitor Summary */}
                  {selectedUseCase?.competitor_summary && (
                    <CompetitorSummary
                      summary={selectedUseCase.competitor_summary}
                      hotFeatures={selectedUseCase.hot_features_summary}
                    />
                  )}

                   {/* Reddit Posts */}
                   <div className="space-y-4">
                     {visiblePosts.length === 0 ? (
                       <div className="glass-card rounded-2xl p-8 text-center">
                         <p className="text-white/80 font-body">
                           {selectedTags.size > 0
                             ? "No posts found matching the selected filters."
                             : "No posts found for this use case."}
                         </p>
                       </div>
                     ) : (
                       visiblePosts.map((post) => (
                         <RedditPostListItem key={post.id} post={post} />
                       ))
                     )}
                   </div>

                   {/* Pagination Controls */}
                   <div className="mt-6 flex items-center justify-between gap-4 pb-6">
                     <div className="text-sm text-white/70 font-body">
                       Showing {totalPosts === 0 ? 0 : startIndex + 1}–
                       {Math.min(startIndex + pageSize, totalPosts)} of {totalPosts}
                     </div>
                     <div className="flex items-center gap-2">
                       <button
                         className={`px-4 py-2 rounded-xl font-body font-medium text-sm transition-all ${
                           page > 1
                             ? "glass-button text-white hover:text-white"
                             : "glass-button text-white/50 cursor-not-allowed"
                         }`}
                         onClick={() => setPage((p) => Math.max(1, p - 1))}
                         disabled={page <= 1}
                       >
                         Prev
                       </button>
                       <span className="text-white/80 font-body text-sm px-3">
                         Page {page} / {totalPages}
                       </span>
                       <button
                         className={`px-4 py-2 rounded-xl font-body font-medium text-sm transition-all ${
                           page < totalPages
                             ? "glass-button text-white hover:text-white"
                             : "glass-button text-white/50 cursor-not-allowed"
                         }`}
                         onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                         disabled={page >= totalPages}
                       >
                         Next
                       </button>
                     </div>
                   </div>
                 </>
               )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
