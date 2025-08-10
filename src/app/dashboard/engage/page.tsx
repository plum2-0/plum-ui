"use client";

import { useState, useEffect } from "react";
import { PlumSproutLogo } from "@/components/PlumSproutLogo";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Brand } from "@/types/brand";
import UseCasesSidebar from "@/components/dashboard2/UseCasesSidebar";
import InviteTeammateButton from "@/components/InviteTeammateButton";

export default function DashboardEngagePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [brandData, setBrandData] = useState<Brand | null>(null);
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
      <div className="h-screen flex flex-col relative overflow-hidden">
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
        <div className="flex items-center justify-center h-full relative z-10">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !brandData) {
    return (
      <div className="h-screen flex flex-col relative overflow-hidden">
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
        <div className="flex items-center justify-center h-full relative z-10">
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-white/80 font-body">
              {error || "Failed to load brand data"}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            selectedUseCase={null}
            onUseCaseSelect={() => router.push('/dashboard')}
            onlyUnread={onlyUnread}
            setOnlyUnread={setOnlyUnread}
          />
        </div>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              {/* Page Header */}
              <div className="glass-card rounded-2xl p-8 mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div 
                    className="p-3 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.3))'
                    }}
                  >
                    <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-white font-heading text-3xl font-bold mb-2">
                      Engage
                    </h1>
                    <p className="text-white/80 font-body text-lg">
                      Connect and engage with your community across platforms
                    </p>
                  </div>
                </div>
              </div>

              {/* Coming Soon Content */}
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="mb-6">
                  <div 
                    className="inline-flex p-4 rounded-2xl mb-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.2))'
                    }}
                  >
                    <svg className="w-12 h-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                  <h2 className="text-white font-heading text-2xl font-bold mb-3">
                    Engagement Features Coming Soon
                  </h2>
                  <p className="text-white/70 font-body text-lg max-w-2xl mx-auto">
                    We're building powerful engagement tools to help you connect with your audience, 
                    manage conversations, and grow your community presence across all platforms.
                  </p>
                </div>

                {/* Feature Preview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div 
                    className="p-6 rounded-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <svg className="w-8 h-8 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m-2-4h6a2 2 0 012 2v6a2 2 0 01-2 2H9l-4 4V8a2 2 0 012-2z" />
                    </svg>
                    <h3 className="text-white font-heading text-lg font-semibold mb-2">
                      Reply Management
                    </h3>
                    <p className="text-white/60 font-body text-sm">
                      Manage and schedule replies across multiple platforms from one dashboard.
                    </p>
                  </div>

                  <div 
                    className="p-6 rounded-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <svg className="w-8 h-8 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <h3 className="text-white font-heading text-lg font-semibold mb-2">
                      Analytics
                    </h3>
                    <p className="text-white/60 font-body text-sm">
                      Track engagement metrics and measure the impact of your interactions.
                    </p>
                  </div>

                  <div 
                    className="p-6 rounded-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <svg className="w-8 h-8 text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
                    </svg>
                    <h3 className="text-white font-heading text-lg font-semibold mb-2">
                      Automation
                    </h3>
                    <p className="text-white/60 font-body text-sm">
                      Set up automated responses and engagement workflows to scale your presence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 