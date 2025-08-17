"use client";

interface HeroMetricProps {
  value: number;
  label?: string;
  subtext?: string;
}

export default function HeroMetric({
  value,
  label = "Potential Customers Identified",
  subtext,
}: HeroMetricProps) {
  return (
    <div className="flex justify-center">
      <div
        className="relative group w-full max-w-md px-8 py-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-default"
        style={{
          background:
            "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow:
            "0 8px 32px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(circle at center, rgba(34, 197, 94, 0.1) 0%, transparent 70%)",
          }}
        />
        <div className="relative text-center">
          <div className="text-white/70 text-sm font-body mb-2">
            {label}
          </div>
          <div className="text-emerald-300 text-5xl font-heading font-bold">
            {value}
          </div>
          {subtext && (
            <div className="text-white/60 text-xs font-body mt-2">
              {subtext}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}