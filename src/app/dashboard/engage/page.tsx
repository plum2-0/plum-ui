"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard2/DashboardSidebar";
import SummaryStats from "@/components/agent-dashboard/SummaryStats";
import ActionsPanel from "@/components/agent-dashboard/ActionsPanel";
import TimelineView from "@/components/agent-dashboard/TimelineView";

export default function AgentDashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      // First, generate new actions
  const generateResponse = await fetch("/api/actions/suggestions", {
        method: "GET",
      });

      if (!generateResponse.ok) {
        console.error(
          "Failed to generate new actions:",
          await generateResponse.text()
        );
      }

      // Then refresh the components by updating the refresh key
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="w-64 shrink-0">
        <DashboardSidebar />
      </div>

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="flex flex-col h-full">
          {/* Header Section */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-2xl font-bold text-white tracking-wide">
                  AI Agent Dashboard
                </h1>
                <p className="text-sm text-white/60 font-body mt-1">
                  Automated Reddit Engagement
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-body font-medium text-sm text-white transition-all duration-300 ${
                  isRefreshing
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105"
                }`}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <svg
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
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
                {isRefreshing ? "Generating..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto px-6 py-6">
            {/* Summary Statistics Bar */}
            <SummaryStats refreshKey={refreshKey} />

            {/* Main Dashboard Grid */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
              <ActionsPanel refreshKey={refreshKey} />

              {/* Timeline View */}
              <TimelineView refreshKey={refreshKey} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
