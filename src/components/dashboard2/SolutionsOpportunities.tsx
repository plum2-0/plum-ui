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
        <h4 className="text-white/90 font-heading text-lg font-semibold mb-4 flex items-center gap-2">
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
          <div
            key={index}
            className="group relative p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-default"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.03) 100%)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow:
                "0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(34, 197, 94, 0.1))",
              }}
            />
            <div className="relative flex items-center gap-3">
              <div
                className="p-1.5 rounded-lg shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(34, 197, 94, 0.2))",
                }}
              >
                <svg
                  className="w-4 h-4 text-white"
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
              </div>
              <p className="text-white/90 font-body text-sm leading-relaxed">
                {item}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
