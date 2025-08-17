"use client";

interface GlassPillItem {
  label: string;
  count?: number;
}

interface GlassPillsProps {
  items: GlassPillItem[];
  variant?: "keywords" | "subreddits" | "neutral";
  size?: "sm" | "md" | "lg";
  maxVisible?: number;
  prefix?: string;
  emptyText?: string;
}

export default function GlassPills({
  items,
  variant = "neutral",
  size = "md",
  maxVisible = 5,
  prefix = "",
  emptyText = "No items",
}: GlassPillsProps) {
  if (items.length === 0) {
    return (
      <span className="text-white/50 font-body text-sm">
        {emptyText}
      </span>
    );
  }

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "gap-2",
      pill: "px-3 py-1.5 text-sm",
      count: "px-1.5 py-0.5 text-xs",
    },
    md: {
      container: "gap-3",
      pill: "px-4 py-2 text-base",
      count: "px-2 py-0.5 text-xs",
    },
    lg: {
      container: "gap-3",
      pill: "px-5 py-2.5 text-lg",
      count: "px-2 py-0.5 text-sm",
    },
  };

  // Variant configurations
  const variantConfig = {
    keywords: {
      pillStyle: {
        background: "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)",
        border: "1px solid rgba(168, 85, 247, 0.25)",
        boxShadow: "0 2px 12px rgba(168, 85, 247, 0.1)",
      },
      countStyle: {
        background: "rgba(168, 85, 247, 0.25)",
        border: "1px solid rgba(168, 85, 247, 0.35)",
      },
      countClass: "text-purple-300",
      hoverStyle: "hover:border-purple-400/40 hover:shadow-purple-500/20",
    },
    subreddits: {
      pillStyle: {
        background: "linear-gradient(135deg, rgba(251, 146, 60, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)",
        border: "1px solid rgba(251, 146, 60, 0.25)",
        boxShadow: "0 2px 12px rgba(251, 146, 60, 0.1)",
      },
      countStyle: {
        background: "rgba(251, 146, 60, 0.25)",
        border: "1px solid rgba(251, 146, 60, 0.35)",
      },
      countClass: "text-orange-300",
      hoverStyle: "hover:border-orange-400/40 hover:shadow-orange-500/20",
    },
    neutral: {
      pillStyle: {
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
      },
      countStyle: {
        background: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      },
      countClass: "text-white/70",
      hoverStyle: "hover:border-white/25 hover:shadow-white/10",
    },
  };

  const config = sizeConfig[size];
  const vConfig = variantConfig[variant];
  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;

  return (
    <div className={`flex flex-wrap ${config.container}`}>
      {visibleItems.map((item, index) => (
        <div
          key={item.label}
          className={`group relative ${config.pill} rounded-xl transition-all duration-300 hover:scale-[1.05] cursor-default ${vConfig.hoverStyle}`}
          style={vConfig.pillStyle}
        >
          <div className="relative flex items-center gap-2">
            <span className="text-white/90 font-heading font-medium">
              {prefix}{item.label}
            </span>
            {item.count !== undefined && (
              <span
                className={`${config.count} rounded-full font-body ${vConfig.countClass}`}
                style={vConfig.countStyle}
              >
                {item.count}
              </span>
            )}
          </div>
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={`${config.pill} rounded-xl cursor-default`}
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <span className="text-white/50 font-body">
            +{remainingCount} more
          </span>
        </div>
      )}
    </div>
  );
}