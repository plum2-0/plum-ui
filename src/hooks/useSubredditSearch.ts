import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface SubredditOption {
  value: string;
  label: string;
  subscribers: number;
  icon_img?: string;
  public_description?: string;
}

interface UseSubredditSearchResult {
  options: SubredditOption[];
  isLoading: boolean;
  error: Error | null;
  searchSubreddits: (query: string) => void;
}

export function useSubredditSearch(): UseSubredditSearchResult {
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['subreddit-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) {
        return { suggestions: [] };
      }

      const response = await fetch(`/api/subreddit/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search subreddits');
      }

      return response.json();
    },
    enabled: searchQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const searchSubreddits = useCallback((query: string) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debouncing
    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(query);
    }, 300); // 300ms debounce
  }, []);

  // Format options for react-select
  const options: SubredditOption[] = (data?.suggestions || []).map((subreddit: {
    name: string;
    display_name: string;
    subscribers: number;
    icon_img?: string;
    public_description?: string;
  }) => ({
    value: subreddit.name,
    label: subreddit.display_name,
    subscribers: subreddit.subscribers,
    icon_img: subreddit.icon_img,
    public_description: subreddit.public_description,
  }));

  return {
    options,
    isLoading,
    error: error as Error | null,
    searchSubreddits,
  };
}