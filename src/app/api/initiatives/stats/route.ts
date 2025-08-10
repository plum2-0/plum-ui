import { NextResponse } from "next/server";

// Mock statistics data
const mockStats = {
  todaysEngagements: 247,
  todaysEngagementsChange: "+12%",
  weeklyGrowth: "+23%",
  weeklyGrowthValue: 1842,
  successRate: 87,
  successRateChange: "+5%",
  karmaGained: 1234,
  karmaGainedChange: "+18%",
  pendingActions: 8,
  pendingActionsUrgent: 3,
  timestamp: new Date().toISOString()
};

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Add some randomization to make it feel more real
  const stats = {
    ...mockStats,
    todaysEngagements: mockStats.todaysEngagements + Math.floor(Math.random() * 10),
    karmaGained: mockStats.karmaGained + Math.floor(Math.random() * 50),
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(stats);
}