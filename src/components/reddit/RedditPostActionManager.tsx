"use client";

import React, { useState } from 'react';
import { useRedditPosts } from '@/hooks/useRedditPosts';
import { usePostActions } from '@/hooks/usePostActions';
import { RedditPostCard } from './RedditPostCard';
import { UserAction } from '@/types/reddit';

interface RedditPostActionManagerProps {
  projectId: string;
}

type FilterStatus = 'all' | 'pending' | 'reviewed';

export function RedditPostActionManager({ projectId }: RedditPostActionManagerProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [currentOffset, setCurrentOffset] = useState(0);
  const limit = 20;

  const { data, isLoading, error, refetch } = useRedditPosts({
    projectId,
    status: filterStatus,
    limit,
    offset: currentOffset,
  });

  const { mutate: updatePostAction, isPending } = usePostActions({
    projectId,
    onSuccess: () => {
      // Optionally show a success message
      console.log('Post action updated successfully');
    },
    onError: (error) => {
      // Handle error - could show a toast notification
      console.error('Failed to update post action:', error);
    },
  });

  const handleAction = (postId: string, action: UserAction, editedResponse?: string) => {
    updatePostAction({ postId, action, editedResponse });
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    setCurrentOffset(prev => prev + limit);
  };

  const filterTabs: Array<{ value: FilterStatus; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
  ];

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading Reddit posts: {error.message}</p>
        <button 
          onClick={handleRefresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {filterTabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => {
                  setFilterStatus(tab.value);
                  setCurrentOffset(0);
                }}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filterStatus === tab.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {data?.total_count || 0} items
            </span>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              <svg 
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && currentOffset === 0 && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-1/3 mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Posts list */}
      {!isLoading && data?.posts && (
        <>
          <div className="space-y-6">
            {data.posts.map(post => (
              <RedditPostCard
                key={post.post_id}
                post={post}
                onAction={handleAction}
                isLoading={isPending}
              />
            ))}
          </div>

          {/* No posts message */}
          {data.posts.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">No posts found matching your criteria.</p>
              <p className="text-gray-500 text-sm mt-2">
                Posts will appear here once they are processed by the matcher service.
              </p>
            </div>
          )}

          {/* Load more button */}
          {data.has_more && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Scroll to top"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}