"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Prospect } from "@/types/brand";
import { useProspect } from "@/contexts/ProspectContext";

interface ProspectSelectorProps {
  prospects: Prospect[];
  placeholder?: string;
}

export default function ProspectSelector({
  prospects,
  placeholder = "Select a prospect",
}: ProspectSelectorProps) {
  const { selectedProspect, setSelectedProspect } = useProspect();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Filter prospects based on search
  const filteredProspects = prospects.filter((prospect) =>
    prospect.problem_to_solve.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8, // 8px gap
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  // Update position when opening dropdown
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      // Update position on scroll/resize
      const handleUpdate = () => updateDropdownPosition();
      window.addEventListener("scroll", handleUpdate);
      window.addEventListener("resize", handleUpdate);
      return () => {
        window.removeEventListener("scroll", handleUpdate);
        window.removeEventListener("resize", handleUpdate);
      };
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative flex-1 max-w-4xl">
      {/* Trigger Button - HEADLINE STYLE */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 rounded-2xl text-left transition-all duration-500 transform-gpu group"
        style={{
          background:
            "linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.08) 100%)",
          backdropFilter: "blur(20px) saturate(1.8) brightness(1.1)",
          WebkitBackdropFilter: "blur(20px) saturate(1.8) brightness(1.1)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          boxShadow: isOpen
            ? "0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.1)"
            : "0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
          transform: isOpen ? "translateY(-3px)" : "translateY(0)",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background =
              "linear-gradient(145deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.12) 100%)";
            e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
            e.currentTarget.style.boxShadow =
              "0 16px 50px rgba(0, 0, 0, 0.2), 0 6px 25px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 0 rgba(0, 0, 0, 0.08)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background =
              "linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.08) 100%)";
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow =
              "0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.05)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.18)";
          }
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className={`font-body text-2xl font-bold leading-tight ${
              selectedProspect ? "text-white" : "text-white/70"
            } drop-shadow-sm`}
          >
            {selectedProspect ? selectedProspect.problem_to_solve : placeholder}
          </span>
          <svg
            className={`w-8 h-8 text-white/60 transition-all duration-500 group-hover:text-white/80 ${
              isOpen ? "rotate-180 text-white/80" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu Portal */}
      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[10000] rounded-xl overflow-hidden"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
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
              {/* Summary Option */}
              <button
                onClick={() => {
                  setSelectedProspect(null);
                  setIsOpen(false);
                  setSearchQuery("");
                }}
                className={`w-full px-4 py-3 text-left transition-all duration-200 hover:bg-white/5 ${
                  !selectedProspect ? "bg-white/10" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: !selectedProspect
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
                          d="M4 6h16M4 12h16M4 18h7"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-body text-sm">
                        Summary - All Prospects
                      </p>
                      <p className="text-white/50 font-body text-xs mt-0.5">
                        View aggregated data across all prospects
                      </p>
                    </div>
                  </div>
                </div>
              </button>

              {/* Divider */}
              <div className="h-px bg-white/10 my-1"></div>

              {/* Individual Prospects */}
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
                              {prospect.sourced_reddit_posts?.length || 0} posts
                              • {prospect.keywords?.length || 0} keywords
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
          </div>,
          document.body
        )}
    </div>
  );
}
