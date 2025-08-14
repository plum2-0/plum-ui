// Agent Core Types
export interface Agent {
  id: string;
  name: string;
  persona: string;
  goal: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  templateId?: string;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  defaultPersona: string;
  defaultGoal: string;
  category: 'customer-support' | 'community-builder' | 'technical-expert' | 'brand-advocate' | 'custom';
  emoji: string;
}

// Conversation Models
export interface RedditAction {
  userPost: {
    thing_id: string;
    content: string;
    author: string;
  };
  agentReply: {
    content: string;
  };
}

export interface RedditConvo {
  parentPost: ConversationPost;
  parentReply: ConversationPost; // The agent's initial reply
  actions: RedditAction[]; // Subsequent interactions
}

export interface Conversation {
  id: string;
  agentId: string;
  platform: 'reddit' | 'twitter' | 'discord' | 'linkedin';
  status: 'monitoring' | 'engaged' | 'archived';
  threadId: string;
  relevanceScore: number;
  createdAt: Date;
  updatedAt: Date;
  isExpanded?: boolean; // UI state
}

export interface ConversationPost {
  id: string;
  content: string;
  author: string;
  authorAvatar?: string;
  createdAt: Date;
  platform: string;
  upvotes?: number;
  replies?: ConversationPost[];
  replyCount?: number;
  permalink: string;
}

// Agent Analytics
export interface RedditMetrics {
  totalKarma: number;
  totalUpvotes: number;
  totalComments: number;
  totalConversations: number;
  totalDownvotes: number;
}

export interface AgentMetrics {
  agentId: string;
  totalConversations: number;
  activeConversations: number;
  responseRate: number;
  engagementRate: number;
  lastActive: Date;
  redditMetrics: RedditMetrics;
}

// API Response Types
export interface AgentListResponse {
  agents: Agent[];
  totalCount: number;
}

export interface AgentDetailResponse {
  agent: Agent;
  redditConversations: RedditConvo[];
  metrics: AgentMetrics;
  totalConversations: number;
}

export interface AgentTemplatesResponse {
  templates: AgentTemplate[];
}

// Form Types
export interface CreateAgentRequest {
  name: string;
  persona: string;
  goal: string;
  templateId?: string;
}

export interface UpdateAgentRequest {
  name?: string;
  persona?: string;
  goal?: string;
  isActive?: boolean;
}

// Reddit API Thread Structure
export interface RedditThreadNode {
  id: string;
  author: string;
  body: string;
  score: number;
  created_utc: number;
  permalink: string;
  replies: RedditThreadNode[];
}