import { useState, useCallback } from "react";
import { useAgents } from "@/hooks/api/useAgentQueries";
import type { Agent } from "@/types/agent";
import type { SubredditPost } from "@/types/brand";

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
export function useAgentReply() {
  const { data, isLoading, error } = useAgents();
  const [isGenerating, setIsGenerating] = useState(false);

  const agents: Agent[] = data?.agents ?? [];

  const mapSubredditPostToAgentRedditPost = (post: SubredditPost) => {
    const createdUtc = Math.floor(new Date(post.created_at).getTime() / 1000);
    return {
      thing_id: `t3_${post.post_id}`,
      content: post.content || post.title,
      author: post.author,
      subreddit: post.subreddit,
      permalink: post.link,
      created_utc: createdUtc,
      score: post.up_votes ?? 0,
      upvotes: post.up_votes ?? undefined,
      downvotes: post.down_votes ?? undefined,
      reply_count: post.num_comments ?? 0,
    };
  };

  const generateWithAgent = useCallback(
    async (
      agentId: string,
      post: SubredditPost,
      options?: { autoReply?: boolean }
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
          brand_id: post.brand_id,
          use_case_id: post.use_case_id,
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
    [agents]
  );

  return {
    agents,
    isLoadingAgents: isLoading,
    agentsError: error,
    isGenerating,
    generateWithAgent,
  } as const;
}
