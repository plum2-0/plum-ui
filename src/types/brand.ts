export interface Brand {
  id: string;
  name: string;
  website: string;
  image: string | null;
  detail: string | null;
  target_use_cases: UseCase[];
  users: any[];
  created_at: string;
  updated_at: string;
  brand_configs: BrandConfig[];
}

export interface UseCase {
  id: string;
  title: string;
  description: string;
  hot_features_summary: string | null;
  competitor_summary: string | null;
  created_at: string;
  brand_id: string;
  subreddit_posts: SubredditPost[];
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
  use_case_id: string;
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