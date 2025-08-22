"use client";

import { ReactNode } from "react";

interface ViewToggleOption {
  key: "research" | "viz";
  label: string;
  icon?: ReactNode;
}

interface ViewToggleProps {
  value: "research" | "viz";
  onChange: (value: "research" | "viz") => void;
  options: ViewToggleOption[];
}

export default function ViewToggle({
  value,
  onChange,
  options,
}: ViewToggleProps) {
  return (
    <div
      className="inline-flex rounded-xl p-1"
      style={{
        background:
          "linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
        backdropFilter: "blur(20px) saturate(1.2)",
        WebkitBackdropFilter: "blur(20px) saturate(1.2)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow:
          "0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      {options.map((option) => {
        const isActive = value === option.key;

        return (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            className={`
              relative px-6 py-2 rounded-lg font-body font-medium text-sm
              transition-all duration-300 transform-gpu
              ${isActive ? "text-white" : "text-white/60 hover:text-white/80"}
            `}
            style={{
              transform: isActive ? "translateY(-1px)" : "translateY(0)",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {/* Sliding Background */}
            {isActive && (
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(34, 197, 94, 0.3) 50%, rgba(168, 85, 247, 0.2) 100%)",
                  backdropFilter: "blur(10px) saturate(1.2)",
                  border: "1px solid rgba(168, 85, 247, 0.2)",
                  boxShadow:
                    "0 4px 12px rgba(168, 85, 247, 0.15), 0 2px 6px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.08)",
                }}
              />
            )}

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
              {option.icon}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
