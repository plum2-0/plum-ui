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
  actions: any[];
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  defaultPersona: string;
  defaultGoal: string;
  category:
    | "customer-support"
    | "community-builder"
    | "technical-expert"
    | "brand-advocate"
    | "custom";
  emoji: string;
}

// Conversation Models
export interface RedditAction {
  actionId?: string;
  status?: string;
  createdAt?: Date;
  completedAt?: Date;
  userPost: {
    thing_id: string;
    content: string;
    author: string;
    authorAvatar?: string;
    subreddit?: string;
    permalink?: string;
    createdAt?: Date;
    score?: number;
    upvotes?: number;
    downvotes?: number;
    replyCount?: number;
  };
  agentReply?: {
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
  platform: "reddit" | "twitter" | "discord" | "linkedin";
  status: "monitoring" | "engaged" | "archived";
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

// Agent Categories and Status
export enum AgentCategory {
  CUSTOM = "custom",
  CUSTOMER_SUPPORT = "customer-support",
  COMMUNITY_BUILDER = "community-builder",
  TECHNICAL_EXPERT = "technical-expert",
  BRAND_ADVOCATE = "brand-advocate",
}

export enum AgentStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PAUSED = "paused",
}

// Reddit Agent Conversation
export interface RedditAgentConvo {
  id: string;
  threadId: string;
  postId: string;
  status: "monitoring" | "engaged" | "archived";
  relevanceScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// Extended Agent Details
export interface AgentDetails {
  id: string;
  brandId: string;
  name: string;
  persona: string;
  goal: string;
  isActive?: boolean;
  avatarUrl?: string;
  templateId?: string;
  category: AgentCategory;
  status: AgentStatus;
  redditUsername?: string;
  redditAgentConvos: RedditConvo[];
  metrics?: AgentMetrics;
  createdAt: Date;
  updatedAt: Date;
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
  avatarUrl?: string;
  avatarStyle?: string;
}

export interface UpdateAgentRequest {
  name?: string;
  persona?: string;
  goal?: string;
  isActive?: boolean;
  avatarUrl?: string;
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
