"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PlumSproutLogo } from "@/components/PlumSproutLogo";
import Link from "next/link";
import SummaryStats from "@/components/agent-dashboard/SummaryStats";
import InitiativesPanel from "@/components/agent-dashboard/InitiativesPanel";
import TimelineView from "@/components/agent-dashboard/TimelineView";

export default function AgentDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check authentication
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/auth/signin");
    } else {
      setIsLoading(false);
    }
  }, [session, status, router]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.3), transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(239, 68, 68, 0.2), transparent 50%),
              linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
            `,
          }}
        />
        <div className="animate-pulse text-white text-xl relative z-10 font-body">
          Loading AI Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background with Liquid Glass Effect */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.3), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(239, 68, 68, 0.2), transparent 50%),
            linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
          `,
        }}
      />

      {/* Floating Glass Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-30 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.1) 70%, transparent 100%)",
            filter: "blur(40px)",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-40 right-32 w-96 h-96 rounded-full opacity-25 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.1) 70%, transparent 100%)",
            filter: "blur(50px)",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, rgba(249, 115, 22, 0.05) 70%, transparent 100%)",
            filter: "blur(30px)",
            animation: "float 10s ease-in-out infinite",
          }}
        />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(10px) rotate(240deg);
          }
        }
      `}</style>

      {/* Fixed Header */}
      <header className="glass-header px-6 py-4 relative z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl glass-card">
              <PlumSproutLogo className="w-6 h-6" />
            </div>
            <div>
              <span className="font-heading text-lg font-bold text-white tracking-wide">
                AI Agent Dashboard
              </span>
              <p className="text-xs text-white/60 font-body">
                Automated Reddit Engagement
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-body font-medium text-sm text-white transition-all duration-300 hover:scale-105"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
            <Link
              href="/api/auth/signout"
              className="text-white/60 hover:text-white font-body text-sm transition-colors"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-6">
        {/* Summary Statistics Bar */}
        <SummaryStats refreshKey={refreshKey} />

        {/* Main Dashboard Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* AI Initiatives Panel */}
          <InitiativesPanel refreshKey={refreshKey} />

          {/* Timeline View */}
          <TimelineView refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
