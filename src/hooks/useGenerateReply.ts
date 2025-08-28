import { useState, useCallback, useEffect } from "react";
import { useAgents } from "@/hooks/api/useAgentQueries";
import type { Agent } from "@/types/agent";
import type { RedditPost } from "@/types/brand";
import { useBrand } from "@/contexts/BrandContext";

type GenerateResult = {
  content: string;
  conversationId?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_PLUM_API_BASE_URL || "http://localhost:8000";

/**
 * Shared hook for generating a reply using a selected agent
 * Works with RedditPost type and calls backend API directly
 */
export function useGenerateReply() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { brand: brandData } = useBrand();

  // Fetch brand data once when component mounts

  const agentReply = useCallback(
    async (agent: Agent, post: RedditPost): Promise<GenerateResult> => {
      setIsGenerating(true);
      try {
        if (!brandData) {
          throw new Error("Brand data not loaded");
        }

        // Build PlumReplyGenerationRequest
        const payload = {
          brand: brandData,
          agent: agent,
          conversation_thread: [post],
        };

        const resp = await fetch(`${API_BASE}/api/agents/generate/reply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || "Failed to generate reply");
        }

        const response = await resp.json();
        return {
          content: response.generated_reply || "",
          conversationId: undefined,
        };
      } finally {
        setIsGenerating(false);
      }
    },
    [brandData]
  );

  return {
    isGenerating,
    agentReply,
  } as const;
}
