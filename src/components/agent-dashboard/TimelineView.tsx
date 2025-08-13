"use client";

import { useState } from "react";
import { useActionTimeline } from "@/hooks/api/useActionQueries";

interface TimelineViewProps {
  refreshKey: number;
}

export default function TimelineView({ refreshKey }: TimelineViewProps) {
  const { data, isLoading: loading } = useActionTimeline();
  const timeline = data?.timeline || null;
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "post": return "📝";
      case "comment": return "💬";
      case "like": return "❤️";
      case "follow": return "👤";
      default: return "📌";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-400 bg-green-500/10";
      case "scheduled": return "text-blue-400 bg-blue-500/10";
      case "in_progress": return "text-orange-400 bg-orange-500/10";
      case "failed": return "text-red-400 bg-red-500/10";
      case "planned": return "text-purple-400 bg-purple-500/10";
      default: return "text-gray-400 bg-gray-500/10";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "scheduled": return "bg-blue-500 animate-pulse";
      case "in_progress": return "bg-orange-500 animate-pulse";
      case "failed": return "bg-red-500";
      case "planned": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-pulse">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 bg-white/10 rounded w-1/2"></div>
              <div className="h-12 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!timeline) return null;

  const sections = [
    { key: "today", data: timeline.today, isCollapsed: false },
    { key: "tomorrow", data: timeline.tomorrow, isCollapsed: false },
    { key: "upcoming", data: timeline.upcoming, isCollapsed: true },
    { key: "completed", data: timeline.completed, isCollapsed: true }
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-xl font-heading font-bold text-white mb-6">
        Timeline
      </h2>

      <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
        {sections.map((section) => (
          <div key={section.key} className="border-l-2 border-white/10 pl-4 relative">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.key)}
              className="flex items-center justify-between w-full text-left mb-3 group"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white/30 rounded-full absolute -left-[7px]"></div>
                <h3 className="font-semibold text-white/80 text-sm">
                  {section.data.date}
                </h3>
                <span className="text-xs text-white/40">
                  ({section.data.events.length})
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
                  collapsedSections.has(section.key) ? "" : "rotate-180"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Events */}
            {!collapsedSections.has(section.key) && (
              <div className="space-y-3">
                {section.data.events.map((event) => (
                  <div
                    key={event.id}
                    className="glass-card rounded-lg p-3 border border-white/5 hover:border-white/10 transition-all duration-300 group relative"
                  >
                    {/* Status Indicator Dot */}
                    <div className={`w-2 h-2 rounded-full absolute -left-[21px] top-4 ${getStatusDot(event.status)}`}></div>

                    {/* Time */}
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-white/50 font-medium">
                        {event.time}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>

                    {/* Event Content */}
                    <div className="flex items-start gap-2">
                      <span className="text-lg mt-0.5">{getEventIcon(event.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white line-clamp-1">
                          {event.title}
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                          {event.subreddit}
                        </p>

                        {/* Additional Info */}
                        {event.confidence && (
                          <div className="mt-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-white/40">Confidence</span>
                              <span className="text-xs text-white/60">{event.confidence}%</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-400 to-purple-500"
                                style={{ width: `${event.confidence}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {event.karma && (
                          <p className="text-xs text-green-400 mt-2">
                            +{event.karma} karma
                          </p>
                        )}

                        {event.count && (
                          <p className="text-xs text-white/50 mt-2">
                            {event.count} {event.type === "like" ? "posts" : "items"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons (shown on hover) */}
                    {event.status === "scheduled" && (
                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="flex-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all">
                          View
                        </button>
                        <button className="flex-1 px-2 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium transition-all">
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex justify-between text-xs">
          <div>
            <span className="text-white/50">Scheduled: </span>
            <span className="text-blue-400 font-medium">9</span>
          </div>
          <div>
            <span className="text-white/50">Completed: </span>
            <span className="text-green-400 font-medium">3</span>
          </div>
          <div>
            <span className="text-white/50">Success Rate: </span>
            <span className="text-purple-400 font-medium">87%</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}