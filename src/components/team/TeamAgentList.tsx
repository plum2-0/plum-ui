"use client";

import { useState, useRef, useEffect } from "react";
import { Agent } from "@/types/agent";
import { useAgents } from "@/hooks/api/useAgentQueries";
import { useRouter } from "next/navigation";
import AgentModal from "./AgentModal";

interface TeamAgentListProps {
  onAgentSelect?: (agentId: string) => void;
}

export default function TeamAgentList({ onAgentSelect }: TeamAgentListProps) {
  const router = useRouter();
  const { data, isLoading, error } = useAgents();
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const agents = data?.agents || [];

  const handleAgentClick = (agentId: string) => {
    if (onAgentSelect) {
      onAgentSelect(agentId);
    } else {
      router.push(`/dashboard/team/${agentId}`);
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-32 flex items-center gap-4 px-6 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-72 h-28 rounded-2xl animate-pulse"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-32 flex items-center justify-center">
        <p className="text-red-400 font-body">Failed to load agents</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Scroll Buttons */}
      {agents.length > 3 && (
        <>
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Agent Cards Container */}
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-4 px-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: { display: 'none' }
        }}
      >
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => handleAgentClick(agent.id)}
            onMouseEnter={() => setHoveredAgent(agent.id)}
            onMouseLeave={() => setHoveredAgent(null)}
            className="shrink-0 snap-start w-72 h-28 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 relative overflow-hidden"
            style={{
              background: hoveredAgent === agent.id
                ? "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(34, 197, 94, 0.15))"
                : "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: hoveredAgent === agent.id
                ? "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                : "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
              transform: hoveredAgent === agent.id ? "translateY(-4px)" : "translateY(0)",
            }}
          >
            {/* Glow Effect */}
            {agent.isActive && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
            )}

            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div 
                className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-lg"
                style={{
                  background: "linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(34, 197, 94, 0.8))",
                }}
              >
                {agent.name.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-heading font-semibold text-base truncate">
                  {agent.name}
                </h3>
                <p className="text-white/60 text-xs font-body mt-1 line-clamp-2">
                  {agent.persona.substring(0, 60)}...
                </p>
                
                {/* Quick Stats */}
                {hoveredAgent === agent.id && (
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-white/50 text-xs font-body">
                      Active conversations: 0
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Agent Button */}
        <button
          onClick={() => setIsCreating(true)}
          className="shrink-0 snap-start w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90"
          style={{
            background: "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(34, 197, 94, 0.3))",
            backdropFilter: "blur(15px)",
            border: "2px dashed rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          }}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Create Agent Modal */}
      <AgentModal 
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
      />
    </div>
  );
}