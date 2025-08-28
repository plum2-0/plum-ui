import { useState, useCallback, useMemo, useEffect } from "react";
import { useAgents } from "@/hooks/api/useAgentQueries";
import type { Agent } from "@/types/agent";
import type { RedditPost } from "@/types/brand";

type GenerateResult = {
  content: string;
  conversationId?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_PLUM_API_BASE_URL || "http://localhost:8000";

/**
 * Shared hook for generating a reply using a selected agent
 * Creates a conversation for the agent and optional auto-reply to get content
 */
export function useAgentReply(brandId: string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { data, isLoading, error } = useAgents(brandId);
  const [brandData, setBrandData] = useState<any>(null);

  const agents: Agent[] = useMemo(() => data ?? [], [data]);

  // Fetch brand data once when component mounts
  useEffect(() => {
    async function fetchBrand() {
      try {
        const response = await fetch(`${API_BASE}/api/brand/${brandId}`);
        if (response.ok) {
          const data = await response.json();
          setBrandData(data);
        }
      } catch (error) {
        console.error("Failed to fetch brand data:", error);
      }
    }
    if (brandId) {
      fetchBrand();
    }
  }, [brandId]);

  const generateWithAgent = useCallback(
    async (agentId: string, post: RedditPost): Promise<GenerateResult> => {
      setIsGenerating(true);
      try {
        const agent = agents.find((a) => a.id === agentId);

        if (!brandData) {
          throw new Error("Brand data not loaded");
        }

        // Build PlumReplyGenerationRequest
        const payload = {
          brand: brandData,
          agent: agent,
          conversation_thread: [post], // Single post as conversation thread
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
          conversationId: undefined, // No conversation ID from this endpoint
        };
      } finally {
        setIsGenerating(false);
      }
    },
    [agents, brandData]
  );

  return {
    agents,
    isLoadingAgents: isLoading,
    agentsError: error,
    isGenerating,
    isBrandLoaded: !!brandData,
    generateWithAgent,
  } as const;
}
