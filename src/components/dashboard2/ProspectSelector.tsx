"use client";

import { useState, useRef, useEffect } from "react";
import { Prospect } from "@/types/brand";
import GlassPanel from "@/components/ui/GlassPanel";

interface ProspectSelectorProps {
  prospects: Prospect[];
  selectedProspect: Prospect | null;
  onSelect: (prospect: Prospect | null) => void;
  placeholder?: string;
}

export default function ProspectSelector({
  prospects,
  selectedProspect,
  onSelect,
  placeholder = "Select a prospect",
}: ProspectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter prospects based on search
  const filteredProspects = prospects.filter((prospect) =>
    prospect.problem_to_solve.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (prospect: Prospect) => {
    onSelect(prospect);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative flex-1 max-w-md" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl text-left transition-all duration-300 transform-gpu"
        style={{
          background:
            "linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
          backdropFilter: "blur(20px) saturate(1.2)",
          WebkitBackdropFilter: "blur(20px) saturate(1.2)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: isOpen
            ? "0 8px 32px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 0 rgba(0, 0, 0, 0.08)"
            : "0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
          transform: isOpen ? "translateY(-1px)" : "translateY(0)",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background =
              "linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)";
            e.currentTarget.style.transform = "translateY(-1px) scale(1.02)";
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.08)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background =
              "linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)";
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow =
              "0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)";
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: selectedProspect
                  ? "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(34, 197, 94, 0.3))"
                  : "rgba(255, 255, 255, 0.1)",
              }}
            >
              <svg
                className="w-4 h-4 text-white/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span
              className={`font-body ${
                selectedProspect ? "text-white" : "text-white/50"
              }`}
            >
              {selectedProspect
                ? selectedProspect.problem_to_solve
                : placeholder}
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-white/70 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full mt-2 w-full z-50 rounded-xl overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, rgba(17, 24, 39, 0.95) 0%, rgba(17, 24, 39, 0.9) 100%)",
            backdropFilter: "blur(20px) saturate(1.2)",
            WebkitBackdropFilter: "blur(20px) saturate(1.2)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow:
              "0 16px 48px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prospects..."
                className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 font-body text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Prospects List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredProspects.length > 0 ? (
              filteredProspects.map((prospect) => {
                const isSelected = selectedProspect?.id === prospect.id;
                const hasNewPosts = prospect.sourced_reddit_posts?.some(
                  (post) => post.status === "PENDING"
                );

                return (
                  <button
                    key={prospect.id}
                    onClick={() => handleSelect(prospect)}
                    className={`w-full px-4 py-3 text-left transition-all duration-200 hover:bg-white/5 ${
                      isSelected ? "bg-white/10" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background: isSelected
                              ? "linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(34, 197, 94, 0.4))"
                              : "rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <svg
                            className="w-4 h-4 text-white/70"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-body text-sm">
                            {prospect.problem_to_solve}
                          </p>
                          <p className="text-white/50 font-body text-xs mt-0.5">
                            {prospect.sourced_reddit_posts?.length || 0} posts •{" "}
                            {prospect.keywords?.length || 0} keywords
                          </p>
                        </div>
                      </div>
                      {hasNewPosts && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-white/50 font-body text-sm">
                  No prospects found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
