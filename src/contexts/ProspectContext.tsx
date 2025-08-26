"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { Prospect, RedditPost } from "@/types/brand";

interface PostsByType {
  postCount: number;
  prospectCount: number;
  posts: RedditPost[];
}

interface ProspectWithByType extends Prospect {
  byType: {
    actioned: PostsByType;
    pending: PostsByType;
  };
}

interface ProspectContextType {
  selectedProspect: ProspectWithByType | null;
  setSelectedProspect: (prospect: Prospect | null) => void;
}

const ProspectContext = createContext<ProspectContextType | undefined>(
  undefined
);

function categorizePostsByStatus(posts: RedditPost[]): {
  actioned: RedditPost[];
  pending: RedditPost[];
} {
  const actioned: RedditPost[] = [];
  const pending: RedditPost[] = [];

  posts.forEach((post) => {
    if (post.status === "REPLY") {
      actioned.push(post);
    } else if (post.status === "PENDING" || post.status === "SUGGESTED_REPLY") {
      pending.push(post);
    }
  });

  return { actioned, pending };
}

function getUniqueAuthorCount(posts: RedditPost[]): number {
  const uniqueAuthors = new Set(posts.map((post) => post.author));
  return uniqueAuthors.size;
}

function createPostsByType(posts: RedditPost[]): PostsByType {
  return {
    postCount: posts.length,
    prospectCount: getUniqueAuthorCount(posts),
    posts,
  };
}

export function ProspectProvider({ children }: { children: ReactNode }) {
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(
    null
  );

  const enhancedProspect = useMemo<ProspectWithByType | null>(() => {
    if (!selectedProspect) return null;

    const posts = selectedProspect.sourced_reddit_posts || [];
    const { actioned, pending } = categorizePostsByStatus(posts);

    return {
      ...selectedProspect,
      byType: {
        actioned: createPostsByType(actioned),
        pending: createPostsByType(pending),
      },
    };
  }, [selectedProspect]);

  return (
    <ProspectContext.Provider
      value={{
        selectedProspect: enhancedProspect,
        setSelectedProspect,
      }}
    >
      {children}
    </ProspectContext.Provider>
  );
}

export function useProspect() {
  const context = useContext(ProspectContext);
  if (context === undefined) {
    throw new Error("useProspect must be used within a ProspectProvider");
  }
  return context;
}
