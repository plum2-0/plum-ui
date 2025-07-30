export interface RedditPost {
  title: string;
  author: string;
  subreddit: string;
  created_utc: number;
  time_ago: string;
  score: number;
  upvote_ratio: number;
  comment_count: number;
  link_flair: string;
  domain: string;
  url: string;
  thumbnail: string;
  permalink: string;
  is_self: boolean;
  is_video: boolean;
  post_id: string;
  user_action: 'reply' | 'ignore' | 'edit' | 'pending';
  llm_response: string;
  // Additional fields for UI
  confidence_score?: number;
  matched_topics?: string[];
  parent_comment?: RedditComment;
}

export interface RedditComment {
  id: string;
  author: string;
  body: string;
  created_utc: number;
  score: number;
  parent_id: string;
  permalink: string;
}

export interface PostActionRequest {
  post_id: string;
  action: 'reply' | 'ignore' | 'edit' | 'pending';
  edited_response?: string;
}

export interface PostActionResponse {
  success: boolean;
  message: string;
  updated_post?: RedditPost;
}

export interface RedditPostsResponse {
  success: boolean;
  posts: RedditPost[];
  total_count: number;
  has_more: boolean;
}

export type UserAction = 'reply' | 'ignore' | 'edit' | 'pending';