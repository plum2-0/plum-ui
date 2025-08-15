import { UseCaseInsights } from "@/types/brand";

interface UseCaseInsightsProps {
  insights: UseCaseInsights;
  insightTitle: string;
}

export default function UseCaseInsightsComponent({
  insightTitle,
  insights,
}: UseCaseInsightsProps) {
  console.log(insights);
  return (
    <div className="p-6 border-t border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-white font-heading text-lg font-bold">
              Insights
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* General Summary */}
        <div
          className="p-4 rounded-xl"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-4 h-4 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-white font-heading text-sm font-semibold">
              Market Overview
            </h3>
          </div>
          <p className="text-white/80 font-body text-sm leading-snug">
            {insights.general_summary}
          </p>
        </div>

        {/* Identified Solutions */}
        <div
          className="p-4 rounded-xl"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-4 h-4 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <h3 className="text-white font-heading text-sm font-semibold">
              Solutions & Opportunities
            </h3>
          </div>
          <ul className="space-y-1">
            {insights.identified_solutions.map((solution, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-white/80 font-body text-sm leading-snug"
              >
                <span className="text-green-400 mt-1">•</span>
                <span>{solution}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Willingness to Pay */}
        <div
          className="p-4 rounded-xl"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-4 h-4 text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <h3 className="text-white font-heading text-sm font-semibold">
              Purchase Intent
            </h3>
          </div>
          <p className="text-white/80 font-body text-sm leading-snug">
            {insights.willingness_to_pay}
          </p>
        </div>

        {/* Demographics */}
        <div
          className="p-4 rounded-xl"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-4 h-4 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-white font-heading text-sm font-semibold">
              Target Demographics
            </h3>
          </div>
          <ul className="space-y-1">
            {insights.demographic_breakdown.map((demographic, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-white/80 font-body text-sm leading-snug"
              >
                <span className="text-purple-400 mt-1">•</span>
                <span>{demographic}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Competitors */}
        <div
          className="p-4 rounded-xl lg:col-span-2"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-4 h-4 text-orange-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <h3 className="text-white font-heading text-sm font-semibold">
              Top Competitors
            </h3>
          </div>
          <ul className="flex flex-wrap gap-3">
            {insights.top_competitors.map((competitor, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-white/80 font-body text-sm leading-snug"
              >
                <span className="text-orange-400">•</span>
                <span>{competitor}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
