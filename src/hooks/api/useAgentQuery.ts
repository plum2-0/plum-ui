import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BRAND_QUERY_KEYS } from "./useBrandQuery";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Error types for better error handling
class AgentQueryError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AgentQueryError";
  }
}

// Types for keyword generation
interface GenerateKeywordsParams {
  problem: string;
  topKeywords: string[];
  insights: {
    general_summary: string;
    identified_solutions: string[];
    willingness_to_pay: string;
    demographic_breakdown: string[];
    top_competitors: string[];
    tag_counts: {
      potential_customer: number;
      competitor_mention: number;
    };
  };
}

interface GenerateKeywordsResponse {
  keywords: string[];
}

// API function for generating keywords
async function generateKeywords(
  params: GenerateKeywordsParams
): Promise<GenerateKeywordsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/agents/generate/keywords`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Plum-UI/1.0",
      },
      body: JSON.stringify({
        problem: params.problem,
        top_keywords: params.topKeywords,
        insights: params.insights,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to generate keywords:", errorText);
    throw new AgentQueryError(
      `Failed to generate keywords: ${errorText}`,
      response.status
    );
  }

  const data = await response.json();
  return data;
}

/**
 * Hook to generate AI-powered keyword suggestions
 */
export function useGenerateKeywords() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateKeywords,
    onSuccess: (data) => {
      console.log("Successfully generated keywords:", data);
      // Optionally invalidate brand queries to refresh data
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.all });
    },
    onError: (error) => {
      console.error("Failed to generate keywords:", error);
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}