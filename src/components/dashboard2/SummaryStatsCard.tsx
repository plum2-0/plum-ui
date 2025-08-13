interface SummaryItem {
  label: string;
  count?: number;
}

interface SummaryStatsCardProps {
  title: string;
  items: SummaryItem[];
  emptyText: string;
  prefix?: string;
  size?: "sm" | "md";
  className?: string;
}

export default function SummaryStatsCard({
  title,
  items,
  emptyText,
  prefix = "",
  size = "md",
  className = "",
}: SummaryStatsCardProps) {
  const isSmall = size === "sm";

  const containerPadding = isSmall ? "p-3" : "p-4";
  const containerRadius = isSmall ? "rounded-lg" : "rounded-xl";
  const containerStyle = isSmall
    ? {
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }
    : {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      };

  const titleSpacing = isSmall ? "mb-1" : "mb-3";
  const chipPadding = isSmall ? "px-2 py-0.5" : "px-3 py-1";
  const chipText = isSmall ? "text-xs" : "text-sm";

  return (
    <div
      className={`${containerPadding} ${containerRadius} ${className}`.trim()}
      style={containerStyle}
    >
      <div className={`text-white/70 text-xs font-body ${titleSpacing}`}>
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span
            className={`text-white/60 font-body ${
              isSmall ? "text-xs" : "text-sm"
            }`}
          >
            {emptyText}
          </span>
        ) : (
          items.map(({ label, count }) => (
            <span
              key={label}
              className={`${chipPadding} rounded-full ${chipText} font-body text-white/90`}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              {prefix}
              {label}
              {typeof count === "number" ? ` · ${count}` : ""}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
