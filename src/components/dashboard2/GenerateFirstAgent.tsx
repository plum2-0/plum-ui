"use client";

import { useState } from "react";
import { useBrandQuery } from "@/hooks/api/useBrandQuery";
import { useGenerateAgent } from "@/hooks/api/useAgentQueries";

type GenerateFirstAgentProps = {
  message?: string;
  className?: string;
  center?: boolean;
};

export default function GenerateFirstAgent({
  message = "No agents available yet. Generate your first AI agent to start engaging with posts.",
  className = "",
  center = true,
}: GenerateFirstAgentProps) {
  const { data: brandData } = useBrandQuery();
  const generateAgent = useGenerateAgent();
  const [isGeneratingAgent, setIsGeneratingAgent] = useState(false);

  const handleGenerateAgent = async () => {
    if (!brandData?.brand?.id) {
      alert("Brand ID not found. Please refresh and try again.");
      return;
    }

    setIsGeneratingAgent(true);
    try {
      await generateAgent.mutateAsync(brandData.brand.id);
    } catch (error) {
      console.error("Failed to generate agent:", error);
      alert("Failed to generate agent. Please try again.");
    } finally {
      setIsGeneratingAgent(false);
    }
  };

  return (
    <div
      className={`${
        center ? "flex flex-col items-center justify-center" : ""
      } py-8 space-y-4 ${className}`}
    >
      <div className="text-white/60 text-sm text-center">{message}</div>
      <button
        onClick={handleGenerateAgent}
        disabled={isGeneratingAgent}
        className="px-6 py-3 rounded-xl font-body font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
        style={{
          background:
            "linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(147, 51, 234, 0.8))",
          color: "white",
          border: "1px solid rgba(168, 85, 247, 0.3)",
          boxShadow: "0 4px 12px rgba(168, 85, 247, 0.3)",
          opacity: isGeneratingAgent ? 0.7 : 1,
        }}
      >
        {isGeneratingAgent ? (
          <>
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating AI Agent...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Generate Your First AI Agent
          </>
        )}
      </button>
    </div>
  );
}
