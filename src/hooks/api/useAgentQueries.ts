import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Agent,
  AgentListResponse,
  AgentDetails,
  AgentTemplatesResponse,
  CreateAgentRequest,
  UpdateAgentRequest,
  RedditThreadNode,
  AgentCategory,
  AgentStatus,
} from "@/types/agent";
import { getBrandIdFromCookie } from "@/lib/cookies";

const API_BASE =
  process.env.NEXT_PUBLIC_PLUM_API_BASE_URL || "http://localhost:8000";

// Mapping helpers: Python (snake_case) -> UI (camelCase)

// Query keys
export const AGENT_QUERY_KEYS = {
  all: ["agents"] as const,
  lists: () => [...AGENT_QUERY_KEYS.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...AGENT_QUERY_KEYS.lists(), filters] as const,
  details: () => [...AGENT_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...AGENT_QUERY_KEYS.details(), id] as const,
  templates: ["agent-templates"] as const,
  redditThread: (threadId: string) => ["reddit-thread", threadId] as const,
} as const;

// Queries
export const useAgents = (brandId?: string) =>
  useQuery<Agent[]>({
    queryKey: brandId
      ? [...AGENT_QUERY_KEYS.lists(), brandId]
      : AGENT_QUERY_KEYS.lists(),
    queryFn: async () => {
      // Get brandId from cookie if not provided
      const effectiveBrandId = brandId || getBrandIdFromCookie();
      if (!effectiveBrandId) {
        console.log("ℹ️ No brand ID available, returning empty agents list");
        return [];
      }

      const response = await fetch(
        `${API_BASE}/api/agents/brand/${effectiveBrandId}`
      );
      if (!response.ok) {
        if (response.status === 404) {
          // User needs onboarding
          console.log("ℹ️ User needs onboarding, returning empty agents list");
          return [];
        }
        console.error("❌ Failed to fetch agents:", response.statusText);
        throw new Error("Failed to fetch agents");
      }
      
      // Response is a list of PlumAgent objects
      const data = await response.json();
      
      // Map PlumAgent (snake_case) to Agent (camelCase)
      const agents: Agent[] = data.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        persona: agent.persona,
        goal: agent.goal,
        avatar: agent.avatar_url,
        createdAt: new Date(agent.created_at),
        updatedAt: new Date(agent.created_at), // Using created_at since PlumAgent doesn't have updated_at
        isActive: true, // PlumAgent doesn't have status field
        templateId: undefined, // PlumAgent doesn't have template_id
      }));
      
      return agents;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

export const useAgent = (agentId: string, options?: { enabled?: boolean }) =>
  useQuery<AgentDetails>({
    queryKey: AGENT_QUERY_KEYS.detail(agentId),
    enabled: options?.enabled ?? !!agentId,
    queryFn: async () => {
      if (!agentId) {
        throw new Error("Agent ID is required");
      }
      
      // Call FastAPI endpoint directly
      const response = await fetch(`${API_BASE}/api/agents/${agentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch agent details");
      }
      const data = await response.json();

      // Map PlumAgent (snake_case) to AgentDetails (camelCase)
      const mapped: AgentDetails = {
        id: data.id,
        brandId: getBrandIdFromCookie() || "", // PlumAgent doesn't have brand_id field
        name: data.name,
        persona: data.persona,
        goal: data.goal,
        isActive: true, // PlumAgent doesn't have status field
        avatarUrl: data.avatar_url ?? undefined,
        templateId: undefined, // PlumAgent doesn't have template_id
        category: AgentCategory.CUSTOM, // Default category since PlumAgent doesn't have this
        status: AgentStatus.ACTIVE, // Default status since PlumAgent doesn't have this
        redditUsername: undefined, // PlumAgent doesn't have reddit_username
        redditAgentConvos: Array.isArray(data.reddit_agent_convos)
          ? data.reddit_agent_convos.map((c: any) => {
              const parentPost = c.parent_post || {};
              const parentReply = c.parent_reply || {};
              const createdAtMs = parentPost.created_utc
                ? Number(parentPost.created_utc) * 1000
                : Date.now();

              return {
                parentPost: {
                  id: parentPost.thing_id ?? c.conversation_id ?? "",
                  content: parentPost.content ?? "",
                  author: parentPost.author ?? "",
                  authorAvatar: parentPost.author_avatar ?? undefined,
                  createdAt: new Date(createdAtMs) as unknown as Date,
                  platform: parentPost.subreddit ?? "reddit",
                  upvotes: parentPost.upvotes ?? parentPost.score ?? 0,
                  replyCount: parentPost.reply_count ?? 0,
                  permalink: parentPost.permalink ?? "",
                },
                parentReply: {
                  id: parentReply.thing_id ?? c.conversation_id ?? "",
                  content: parentReply.content ?? "",
                  author: data.reddit_username ?? data.name ?? "agent",
                  createdAt: new Date(
                    parentReply.posted_at ||
                      parentReply.generated_at ||
                      Date.now()
                  ) as unknown as Date,
                  platform: parentPost.subreddit ?? "reddit",
                  permalink: parentPost.permalink ?? "",
                },
                actions: Array.isArray(c.actions)
                  ? c.actions.map((a: any) => ({
                      actionId: a.action_id ?? undefined,
                      status: a.status ?? undefined,
                      createdAt: a.created_at
                        ? (new Date(a.created_at) as unknown as Date)
                        : undefined,
                      completedAt: a.completed_at
                        ? (new Date(a.completed_at) as unknown as Date)
                        : undefined,
                      userPost: {
                        thing_id: a.user_post?.thing_id ?? "",
                        content: a.user_post?.content ?? "",
                        author: a.user_post?.author ?? "",
                        authorAvatar: a.user_post?.author_avatar ?? undefined,
                        subreddit: a.user_post?.subreddit ?? undefined,
                        permalink: a.user_post?.permalink ?? undefined,
                        createdAt: a.user_post?.created_utc
                          ? (new Date(
                              Number(a.user_post.created_utc) * 1000
                            ) as unknown as Date)
                          : undefined,
                        score: a.user_post?.score ?? undefined,
                        upvotes: a.user_post?.upvotes ?? undefined,
                        downvotes: a.user_post?.downvotes ?? undefined,
                        replyCount: a.user_post?.reply_count ?? undefined,
                      },
                      agentReply: a.agent_reply
                        ? {
                            content: a.agent_reply.content ?? "",
                          }
                        : undefined,
                    }))
                  : [],
              };
            })
          : [],
        metrics: undefined, // PlumAgent doesn't have metrics
        createdAt: new Date(data.created_at ?? Date.now()) as unknown as Date,
        updatedAt: new Date(data.created_at ?? Date.now()) as unknown as Date, // Using created_at since no updated_at
      };

      return mapped;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!agentId,
  });

// Fetch full Reddit thread (directly from Reddit API)
export const useRedditThread = (threadId: string) =>
  useQuery<RedditThreadNode>({
    queryKey: AGENT_QUERY_KEYS.redditThread(threadId),
    queryFn: async () => {
      const response = await fetch(`/api/reddit/thread/${threadId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch Reddit thread");
      }
      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    enabled: !!threadId,
  });

// Mutations
export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<Agent, Error, CreateAgentRequest>({
    mutationFn: async (data) => {
      const brandId = getBrandIdFromCookie();
      if (!brandId) throw new Error("Brand not selected");
      const payload = {
        brand_id: brandId,
        name: data.name,
        persona: data.persona,
        goal: data.goal,
        template_id: data.templateId ?? null,
      };
      const response = await fetch(`${API_BASE}/api/agents/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create agent");
      }
      return await response.json();
    },
    onSuccess: (newAgent) => {
      // Optimistically update the agents list
      queryClient.setQueryData<AgentListResponse>(
        AGENT_QUERY_KEYS.lists(),
        (old) => {
          if (!old) return { agents: [newAgent], totalCount: 1 };
          return {
            ...old,
            agents: [...old.agents, newAgent],
            totalCount: old.totalCount + 1,
          };
        }
      );

      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.lists() });
    },
  });
};

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Agent,
    Error,
    { agentId: string; data: UpdateAgentRequest }
  >({
    mutationFn: async ({ agentId, data }) => {
      const payload: Record<string, unknown> = {};
      if (data.name !== undefined) payload["name"] = data.name;
      if (data.persona !== undefined) payload["persona"] = data.persona;
      if (data.goal !== undefined) payload["goal"] = data.goal;
      if (data.isActive !== undefined)
        payload["status"] = data.isActive ? "active" : "paused";
      const response = await fetch(`${API_BASE}/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update agent");
      }
      return await response.json();
    },
    onSuccess: (updatedAgent, { agentId }) => {
      // Update the specific agent in cache
      queryClient.setQueryData<AgentDetails>(
        AGENT_QUERY_KEYS.detail(agentId),
        (old) => {
          if (!old) return old;
          return { ...old, agent: updatedAgent };
        }
      );

      // Update in the list as well
      queryClient.setQueryData<AgentListResponse>(
        AGENT_QUERY_KEYS.lists(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            agents: old.agents.map((agent) =>
              agent.id === agentId ? updatedAgent : agent
            ),
          };
        }
      );

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: AGENT_QUERY_KEYS.detail(agentId),
      });
      queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.lists() });
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (agentId) => {
      const response = await fetch(`${API_BASE}/api/agents/${agentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to delete agent");
      }
    },
    onSuccess: (_, agentId) => {
      // Remove from list cache
      queryClient.setQueryData<AgentListResponse>(
        AGENT_QUERY_KEYS.lists(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            agents: old.agents.filter((agent) => agent.id !== agentId),
            totalCount: old.totalCount - 1,
          };
        }
      );

      // Remove detail cache
      queryClient.removeQueries({ queryKey: AGENT_QUERY_KEYS.detail(agentId) });

      // Invalidate list
      queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.lists() });
    },
  });
};

export const useGenerateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<Agent, Error, string>({
    mutationFn: async (brandId) => {
      const response = await fetch(
        `${API_BASE}/api/agents/brand/${brandId}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to generate agent");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch agent lists
      queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.lists() });
    },
  });
};
