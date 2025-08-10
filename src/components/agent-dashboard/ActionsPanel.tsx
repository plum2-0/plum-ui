"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ActionItem {
  id: string;
  type: "post" | "comment" | "like";
  title: string;
  target: string;
  status: "pending" | "scheduled" | "completed" | "dismissed";
  content: string;
  useCase?: string;
}

interface InitiativesPanelProps {
  refreshKey: number;
}

export default function ActionsPanel({ refreshKey }: InitiativesPanelProps) {
  const router = useRouter();
  const [initiatives, setInitiatives] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "post" | "comment" | "like">(
    "all"
  );

  useEffect(() => {
    const fetchInitiatives = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/actions");
        const data = await response.json();
        const rawActions: any[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.initiatives)
          ? data.initiatives
          : [];

        const mapped: ActionItem[] = rawActions.map((a: any) => {
          const titleFallback =
            a?.title ||
            (a?.action_type === "post"
              ? `Create post in r/${a?.target_subreddit ?? ""}`
              : a?.action_type === "comment"
              ? `Comment in r/${a?.target_subreddit ?? ""}`
              : "Like posts");

          return {
            id: a?.action_id,
            type: a?.action_type,
            title: titleFallback,
            target: a?.target_subreddit ? `r/${a.target_subreddit}` : "",
            status: a?.status,
            content: a?.content ?? "",
            useCase: a?.use_case ?? undefined,
          } as ActionItem;
        });

        setInitiatives(mapped);
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

  console.log(initiatives);

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
                </div>
              </div>
            </div>

            {/* Title and Target */}
            <h3 className="font-semibold text-white mb-2 line-clamp-2">
              {initiative.title}
            </h3>
            {initiative.useCase && (
              <p className="text-sm text-emerald-400 mb-2 font-medium">
                Use Case: {initiative.useCase}
              </p>
            )}
            <p className="text-sm text-white/60 mb-3">
              Target:{" "}
              <span className="text-purple-400">{initiative.target}</span>
            </p>

            {/* like-progress removed for new action schema */}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() =>
                  router.push(`/dashboard/engage/action/${initiative.id}`)
                }
                className="max-w-[250px] px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs font-medium transition-all"
              >
                Schedule
              </button>
              <button
                onClick={() =>
                  router.push(`/dashboard/engage/actions/${initiative.id}`)
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
