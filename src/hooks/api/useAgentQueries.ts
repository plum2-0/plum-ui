import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Agent,
  CreateAgentRequest,
  UpdateAgentRequest,
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
  templates: ["agent-templates"] as const,
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

      return await response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
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
    onSuccess: () => {
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
    onSuccess: () => {
      // Invalidate agent list queries
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
    onSuccess: () => {
      // Invalidate all agent lists to ensure fresh data
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
