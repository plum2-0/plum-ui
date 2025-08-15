export interface BrandOffering {
  title: string;
  description: string;
}

export interface Brand {
  id: string;
  name: string;
  website: string;
  image: string | null;
  detail: string | null;
  brand_description?: string;
  offerings?: BrandOffering[];
  target_problems: Problems[];
  users: any[];
  created_at: string;
  updated_at: string;
  brand_configs: BrandConfig[];
  // Optional source configuration for connected platforms (e.g., Reddit)
  source?: {
    reddit?: RedditSource;
  };
}

export interface Problems {
  id: string;
  problem: string;
  keywords?: string[];
  hot_features_summary: string | null;
  competitor_summary: string | null;
  created_at: string;
  brand_id: string;
  subreddit_posts: SubredditPost[];
  insights?: UseCaseInsights;
}

export interface UseCaseInsights {
  general_summary: string;
  identified_solutions: string[];
  willingness_to_pay: string;
  demographic_breakdown: string[];
  top_competitors: string[];
  tag_counts: {
    potential_customer: number;
    competitor_mention: number;
  };
}

export interface SubredditPost {
  id: string;
  post_id: string;
  subreddit: string;
  title: string;
  author: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  link: string;
  image: string | null;
  up_votes: number;
  down_votes: number;
  num_comments: number;
  llm_explanation: string;
  llm_response: {
    index: number;
    model: string;
  };
  status: string | null;
  tags: PostTags;
  problem_id: string;
  brand_id: string;
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
