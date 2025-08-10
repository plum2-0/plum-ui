"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Initiative {
  id: string;
  type: "post" | "comment" | "like" | "follow";
  title: string;
  target: string;
  confidence: number;
  timeToPost: string;
  status: "pending" | "scheduled" | "active" | "draft";
  content: string;
  tags?: string[];
  expectedKarma?: number;
  priority: "high" | "medium" | "low";
  parentPost?: string;
  postsToLike?: number;
  postsLiked?: number;
}

interface InitiativesPanelProps {
  refreshKey: number;
}

export default function InitiativesPanel({
  refreshKey,
}: InitiativesPanelProps) {
  const router = useRouter();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "post" | "comment" | "like">(
    "all"
  );

  useEffect(() => {
    const fetchInitiatives = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/initiatives");
        const data = await response.json();
        setInitiatives(data.initiatives);
      } catch (error) {
        console.error("Failed to fetch initiatives:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitiatives();
  }, [refreshKey]);

  const filteredInitiatives =
    filter === "all"
      ? initiatives
      : initiatives.filter((i) => i.type === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "post":
        return "📝";
      case "comment":
        return "💬";
      case "like":
        return "❤️";
      case "follow":
        return "👤";
      default:
        return "📌";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "post":
        return "from-purple-400 to-purple-600";
      case "comment":
        return "from-blue-400 to-blue-600";
      case "like":
        return "from-pink-400 to-pink-600";
      case "follow":
        return "from-green-400 to-green-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "medium":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "low":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return { text: "Scheduled", color: "bg-blue-500/20 text-blue-300" };
      case "active":
        return { text: "Active", color: "bg-green-500/20 text-green-300" };
      case "draft":
        return { text: "Draft", color: "bg-gray-500/20 text-gray-300" };
      default:
        return { text: "Pending", color: "bg-yellow-500/20 text-yellow-300" };
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-pulse">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4">
              <div className="h-6 bg-white/10 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-bold text-white">
          AI Suggested Actions
        </h2>
        <div className="flex gap-2">
          {["all", "post", "comment", "like"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === type
                  ? "bg-white/20 text-white border border-white/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              {type === "all"
                ? "All"
                : type.charAt(0).toUpperCase() + type.slice(1) + "s"}
            </button>
          ))}
        </div>
      </div>

      {/* Initiatives List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredInitiatives.map((initiative) => (
          <div
            key={initiative.id}
            className="glass-card rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300 group"
          >
            {/* Header Row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTypeIcon(initiative.type)}</span>
                <div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getTypeColor(
                      initiative.type
                    )} text-white`}
                  >
                    {initiative.type}
                  </span>
                  <span
                    className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                      initiative.priority
                    )}`}
                  >
                    {initiative.priority}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    getStatusBadge(initiative.status).color
                  }`}
                >
                  {getStatusBadge(initiative.status).text}
                </span>
                <span className="text-xs text-white/50">
                  {initiative.timeToPost}
                </span>
              </div>
            </div>

            {/* Title and Target */}
            <h3 className="font-semibold text-white mb-2 line-clamp-2">
              {initiative.title}
            </h3>
            <p className="text-sm text-white/60 mb-3">
              Target:{" "}
              <span className="text-purple-400">{initiative.target}</span>
            </p>

            {/* Confidence Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/50">Confidence</span>
                <span className="text-xs font-medium text-white">
                  {initiative.confidence}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    initiative.confidence >= 85
                      ? "bg-gradient-to-r from-green-400 to-green-500"
                      : initiative.confidence >= 70
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                      : "bg-gradient-to-r from-orange-400 to-orange-500"
                  }`}
                  style={{ width: `${initiative.confidence}%` }}
                />
              </div>
            </div>

            {/* Expected Karma or Progress */}
            {initiative.expectedKarma && (
              <p className="text-xs text-white/50 mb-3">
                Expected Karma:{" "}
                <span className="text-orange-400">
                  ~{initiative.expectedKarma}
                </span>
              </p>
            )}
            {initiative.postsToLike && (
              <p className="text-xs text-white/50 mb-3">
                Progress:{" "}
                <span className="text-green-400">
                  {initiative.postsLiked}/{initiative.postsToLike}
                </span>{" "}
                posts liked
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() =>
                  router.push(`/agent-dashboard/initiative/${initiative.id}`)
                }
                className="max-w-[250px] px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs font-medium transition-all"
              >
                Schedule
              </button>
              <button
                onClick={() =>
                  router.push(`/agent-dashboard/initiative/${initiative.id}`)
                }
                className="max-w-[250px] px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium transition-all"
              >
                Edit
              </button>
              <button className="max-w-[250px] px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium transition-all">
                Dismiss
              </button>
            </div>
          </div>
        ))}
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
