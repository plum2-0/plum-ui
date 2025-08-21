import { useState, useRef, useEffect } from "react";
import GlassPanel from "@/components/ui/GlassPanel";
// Tag filtering temporarily disabled until tags are reintroduced
import FilterTag from "./FilterTag";

interface TagFiltersDropdownProps {
  posts: any[];
  selectedTags: Set<string>;
  onTagToggle: (tagName: string) => void;
  onClearAll: () => void;
}

export default function TagFiltersDropdown({
  posts,
  selectedTags,
  onTagToggle,
  onClearAll,
}: TagFiltersDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate counts for each tag type
  const tagCounts = {
    potential_customer: posts.filter((p) => p.tags.potential_customer).length,
    competitor_mention: posts.filter((p) => p.tags.competitor_mention).length,
    own_mention: posts.filter((p) => p.tags.own_mention).length,
  };

  const hasActiveFilters = selectedTags.size > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <GlassPanel
        as="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-body font-medium text-sm transition-all duration-300 hover:scale-105"
        style={{
          background: hasActiveFilters
            ? "linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(147, 51, 234, 0.8))"
            : "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: hasActiveFilters
            ? "0 4px 12px rgba(168, 85, 247, 0.3)"
            : "0 4px 12px rgba(0, 0, 0, 0.1)",
          color: "white",
        }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filter by Tags
        {hasActiveFilters && (
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-white/20">
            {selectedTags.size}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
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
      </GlassPanel>

      {/* Dropdown Content */}
      {isOpen && (
        <GlassPanel
          className="absolute top-full left-0 mt-2 w-80 rounded-xl p-4 z-50"
          variant="medium"
          style={{
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-heading text-sm font-semibold">
              Filter by Tags
            </h3>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onClearAll();
                  setIsOpen(false);
                }}
                className="text-white/60 hover:text-white font-body text-xs transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-2">
            <FilterTag
              label="Potential Customer"
              count={tagCounts.potential_customer}
              variant="customer"
              isSelected={selectedTags.has("potential_customer")}
              onClick={() => onTagToggle("potential_customer")}
            />
            <FilterTag
              label="Competitor Mention"
              count={tagCounts.competitor_mention}
              variant="competitor"
              isSelected={selectedTags.has("competitor_mention")}
              onClick={() => onTagToggle("competitor_mention")}
            />
            <FilterTag
              label="Own Mention"
              count={tagCounts.own_mention}
              variant="default"
              isSelected={selectedTags.has("own_mention")}
              onClick={() => onTagToggle("own_mention")}
            />
          </div>

          {selectedTags.size > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-white/60 font-body text-xs">
                Showing posts with any of the selected tags
              </p>
            </div>
          )}
        </GlassPanel>
      )}
    </div>
  );
}
