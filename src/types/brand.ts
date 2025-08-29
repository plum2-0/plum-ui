export interface BrandOffering {
  title: string;
  description: string;
}

export interface RedditPost {
  thing_id: string;
  title?: string;
  content: string;
  author: string;
  subreddit: string;
  permalink: string;
  created_utc: number;
  score: number;
  upvotes?: number;
  downvotes?: number;
  reply_count?: number;
  thumbnail?: string;
  link_flair?: string;
  suggested_agent_reply?: string;
  insert_timestamp?: string;
  source_keywords?: string;
  status:
    | "IGNORE"
    | "REPLY"
    | "PENDING"
    | "SUGGESTED_REPLY"
    | "ACTIONED"
    | string;
  tags?: PostTags;
}

export interface RedditPostUI extends RedditPost {
  prospect_id: string;
}

export interface Prospect {
  id: string;
  agent: any | null;
  problem_to_solve: string;
  keywords: string[];
  keywords_to_engaged_count?: Record<string, number>;
  insights: UseCaseInsights | null;
  sourced_reddit_posts: RedditPost[];
  prosepect_profiles: any[];
  total_posts_scraped: number;
  last_refresh_time?: string;
}

export interface Brand {
  id: string;
  name: string;
  website: string;
  image: string | null;
  detail: string | null;
  brand_description: string | null;
  offerings: BrandOffering[];
  prospects: Prospect[];
  logo_url: string | null;
  user_ids: string[];
  users?: any[];
  created_at?: string;
  updated_at?: string;
  brand_configs?: BrandConfig[];
  source?: {
    reddit?: RedditSource;
  };
}

export interface UseCaseInsights {
  general_summary: string;
  identified_solutions: string[];
  willingness_to_pay: string;
  demographic_breakdown: string[];
  X: any;
  top_competitors: string[];
  tag_counts: {
    potential_customer: number;
    competitor_mention: number;
  };
}

export interface PostTags {
  potential_customer: boolean;
  competitor_mention: boolean;
  own_mention: boolean;
  positive_sentiment: boolean;
  negative_sentiment: boolean;
  neutral_sentiment: boolean;
}

export interface BrandConfig {
  response_tone: string;
  response_target: string;
  target_demographics: TargetDemographics;
  created_at: string;
  updated_at: string;
}

export interface TargetDemographics {
  platforms: string[];
  industry_focus: string;
  experience_level: string;
  primary_audience: string;
  interests: string[];
  age_range: string;
  geographic_focus: string;
}

export interface RedditSource {
  oauth_token?: string;
  oauth_token_expires_at?: number;
  refresh_token?: string;
  username?: string;
  connected_subreddit?: string;
}
