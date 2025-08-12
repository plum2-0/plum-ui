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
      // 1) Trigger generation on backend (which also persists)
      const resp = await fetch("/api/engagement/comment-suggestions/generate", {
        method: "POST",
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Failed to generate suggestions");
      }
      // 2) Bump the refresh key so ActionsPanel refetches stored suggestions
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
      <main className="flex-1 overflow-auto px-6 py-6">
        {/* Summary Statistics Bar - moved to top */}
        <SummaryStats refreshKey={refreshKey} />

        {/* Main Dashboard Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          <ActionsPanel
            refreshKey={refreshKey}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />

          {/* Timeline View */}
          <TimelineView refreshKey={refreshKey} />
        </div>
      </main>
    </div>
  );
}
