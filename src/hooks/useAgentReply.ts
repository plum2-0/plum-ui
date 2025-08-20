import { useState, useCallback, useMemo } from "react";
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

  const agents: Agent[] = useMemo(() => data?.agents ?? [], [data?.agents]);

  // No mapping needed; UI RedditPost matches backend RedditPost

  const generateWithAgent = useCallback(
    async (
      agentId: string,
      post: RedditPost,
      options?: { autoReply?: boolean; problemId?: string }
    ): Promise<GenerateResult> => {
      setIsGenerating(true);
      try {
        // Use explicit agent persona/goal fields; keep prompt as tone guidance
        const agent = agents.find((a) => a.id === agentId);
        const prompt = "Generate a helpful, authentic reply";

        const payload = {
          post_content: post.content || "",
          post_title: post.title,
          post_subreddit: post.subreddit,
          prompt: prompt,
          agent_name: agent?.name,
          agent_persona: agent?.persona,
          agent_goal: agent?.goal,
          brand_id: brandId,
          problem_id: options?.problemId,
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
