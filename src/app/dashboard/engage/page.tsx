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
      // Trigger a refresh; ActionsPanel will fetch latest suggestions from backend on refreshKey change
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
