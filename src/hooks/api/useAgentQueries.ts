import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Agent, 
  AgentListResponse, 
  AgentDetailResponse, 
  AgentTemplatesResponse,
  CreateAgentRequest,
  UpdateAgentRequest,
  RedditThreadNode
} from "@/types/agent";

// Query keys
export const AGENT_QUERY_KEYS = {
  all: ["agents"] as const,
  lists: () => [...AGENT_QUERY_KEYS.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...AGENT_QUERY_KEYS.lists(), filters] as const,
  details: () => [...AGENT_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...AGENT_QUERY_KEYS.details(), id] as const,
  templates: ["agent-templates"] as const,
  redditThread: (threadId: string) => ["reddit-thread", threadId] as const,
} as const;

// Queries
export const useAgents = () => 
  useQuery<AgentListResponse>({
    queryKey: AGENT_QUERY_KEYS.lists(),
    queryFn: async () => {
      const response = await fetch('/api/agents');
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

export const useAgent = (agentId: string) =>
  useQuery<AgentDetailResponse>({
    queryKey: AGENT_QUERY_KEYS.detail(agentId),
    queryFn: async () => {
      const response = await fetch(`/api/agents/${agentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch agent details');
      }
      return response.json();
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!agentId,
  });

export const useAgentTemplates = () =>
  useQuery<AgentTemplatesResponse>({
    queryKey: AGENT_QUERY_KEYS.templates,
    queryFn: async () => {
      const response = await fetch('/api/agent-templates');
      if (!response.ok) {
        throw new Error('Failed to fetch agent templates');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Templates don't change often
    gcTime: 10 * 60 * 1000,
  });

// Fetch full Reddit thread (directly from Reddit API)
export const useRedditThread = (threadId: string) =>
  useQuery<RedditThreadNode>({
    queryKey: AGENT_QUERY_KEYS.redditThread(threadId),
    queryFn: async () => {
      const response = await fetch(`/api/reddit/thread/${threadId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Reddit thread');
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
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create agent');
      }
      
      return response.json();
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
  
  return useMutation<Agent, Error, { agentId: string; data: UpdateAgentRequest }>({
    mutationFn: async ({ agentId, data }) => {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update agent');
      }
      
      return response.json();
    },
    onSuccess: (updatedAgent, { agentId }) => {
      // Update the specific agent in cache
      queryClient.setQueryData<AgentDetailResponse>(
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
            agents: old.agents.map(agent => 
              agent.id === agentId ? updatedAgent : agent
            ),
          };
        }
      );
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.detail(agentId) });
      queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.lists() });
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (agentId) => {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete agent');
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
            agents: old.agents.filter(agent => agent.id !== agentId),
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