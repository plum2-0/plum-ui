// Tag filtering temporarily disabled until tags are reintroduced
import FilterTag from "./FilterTag";

interface TagFiltersProps {
  posts: any[];
  selectedTags: Set<string>;
  onTagToggle: (tagName: string) => void;
  onClearAll: () => void;
}

export default function TagFilters({
  posts,
  selectedTags,
  onTagToggle,
  onClearAll,
}: TagFiltersProps) {
  // Calculate counts for each tag type
  const tagCounts = {
    potential_customer: posts.filter((p) => p.tags.potential_customer).length,
    competitor_mention: posts.filter((p) => p.tags.competitor_mention).length,
    own_mention: posts.filter((p) => p.tags.own_mention).length,
  };

  const hasActiveFilters = selectedTags.size > 0;

  return (
    <div
      className="rounded-2xl p-4 mb-6"
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-heading font-semibold tracking-wide">
          Filter by Tags
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-sm text-white/70 hover:text-white transition-colors font-body"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterTag
          label="Potential Customer"
          count={tagCounts.potential_customer}
          isSelected={selectedTags.has("potential_customer")}
          variant="customer"
          onClick={() => onTagToggle("potential_customer")}
        />
        <FilterTag
          label="Competitor Mention"
          count={tagCounts.competitor_mention}
          isSelected={selectedTags.has("competitor_mention")}
          variant="competitor"
          onClick={() => onTagToggle("competitor_mention")}
        />
        <FilterTag
          label="Own Mention"
          count={tagCounts.own_mention}
          isSelected={selectedTags.has("own_mention")}
          variant="default"
          onClick={() => onTagToggle("own_mention")}
        />
      </div>

      {hasActiveFilters && (
        <div className="mt-3 text-sm text-white/80 font-body">
          Showing posts with any of the selected tags
        </div>
      )}
    </div>
  );
}
