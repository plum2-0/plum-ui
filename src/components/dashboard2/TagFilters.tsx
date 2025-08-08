import { SubredditPost } from "@/types/brand";
import FilterTag from "./FilterTag";

interface TagFiltersProps {
  posts: SubredditPost[];
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
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium">Filter by Tags</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-sm text-purple-300 hover:text-white transition-colors"
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
        <div className="mt-3 text-sm text-purple-200">
          Showing posts with any of the selected tags
        </div>
      )}
    </div>
  );
}