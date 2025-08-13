"use client";

import { useActionStats } from "@/hooks/api/useActionQueries";

interface SummaryStatsProps {
  refreshKey: number;
}

export default function SummaryStats({ refreshKey }: SummaryStatsProps) {
  const { data: stats, isLoading: loading } = useActionStats();

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-8 bg-white/10 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      label: "Today's Engagements",
      value: stats.todaysEngagements,
      change: stats.todaysEngagementsChange,
      color: "from-green-400 to-emerald-500",
      icon: "📊"
    },
    {
      label: "Weekly Growth",
      value: stats.weeklyGrowth,
      subValue: `${stats.weeklyGrowthValue} total`,
      color: "from-purple-400 to-purple-500",
      icon: "📈"
    },
    {
      label: "Success Rate",
      value: `${stats.successRate}%`,
      change: stats.successRateChange,
      color: "from-blue-400 to-blue-500",
      icon: "✨"
    },
    {
      label: "Karma Gained",
      value: `+${stats.karmaGained}`,
      change: stats.karmaGainedChange,
      color: "from-orange-400 to-orange-500",
      icon: "⬆️"
    },
    {
      label: "Pending Actions",
      value: stats.pendingActions,
      subValue: stats.pendingActionsUrgent > 0 ? `${stats.pendingActionsUrgent} urgent` : undefined,
      color: stats.pendingActionsUrgent > 0 ? "from-red-400 to-red-500" : "from-gray-400 to-gray-500",
      icon: "⏳"
    }
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="relative group cursor-pointer transition-transform duration-300 hover:scale-105"
          >
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, ${item.color.replace('from-', '').replace(' to-', ', ')})`,
                filter: 'blur(20px)',
                transform: 'scale(0.8)'
              }}
            />
            <div className="relative glass-stat-card rounded-xl p-4 border border-white/10 backdrop-blur-md">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  {item.label}
                </p>
                <span className="text-lg">{item.icon}</span>
              </div>
              <div className="space-y-1">
                <p className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                  {item.value}
                </p>
                {item.change && (
                  <p className={`text-xs font-medium ${
                    item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {item.change}
                  </p>
                )}
                {item.subValue && (
                  <p className="text-xs text-white/50">
                    {item.subValue}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}