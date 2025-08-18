"use client";

interface SolutionsOpportunitiesProps {
  items: string[];
  title?: string;
  showTitle?: boolean;
}

export default function SolutionsOpportunities({
  items,
  title = "Solutions & Opportunities",
  showTitle = true,
}: SolutionsOpportunitiesProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div>
      {showTitle && (
        <h4 className="text-white/90 font-heading text-lg font-semibold mb-2 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-emerald-400"
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
          {title}
        </h4>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item: string, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-emerald-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-white/90 font-body text-[15px] md:text-base font-semibold leading-snug">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
