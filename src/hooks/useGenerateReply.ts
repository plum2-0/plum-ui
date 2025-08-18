import { useState, useCallback } from "react";
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
 * Works with RedditPost type and calls backend API directly
 */
export function useGenerateReply(brandId: string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { data, isLoading, error } = useAgents(brandId);

  const agents: Agent[] = data?.agents ?? [];

  const generateWithAgent = useCallback(
    async (
      agentId: string,
      post: RedditPost,
      options?: { autoReply?: boolean }
    ): Promise<GenerateResult> => {
      setIsGenerating(true);
      try {
        const agent = agents.find((a) => a.id === agentId);
        const prompt = "Generate a helpful, authentic reply";

        const payload = {
          post: post,
          prompt: prompt,
          agent_name: agent?.name,
          agent_persona: agent?.persona,
          agent_goal: agent?.goal,
          brand_id: brandId,
        };

        const resp = await fetch(`${API_BASE}/api/brand/generate/reply`, {
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
    [agents, brandId]
  );

  return {
    agents,
    isLoadingAgents: isLoading,
    agentsError: error,
    isGenerating,
    generateWithAgent,
  } as const;
}