import { NextRequest, NextResponse } from "next/server";
import { RedditThreadNode } from "@/types/agent";

// Mock Reddit thread data
const getMockRedditThread = (threadId: string): RedditThreadNode => {
  return {
    id: "m1abcd2",
    author: "db_guru",
    body: "You can use EXPLAIN ANALYZE to see the actual query plan and timings. Look for seq scans on large tables.",
    score: 87,
    created_utc: 1723612345.0,
    permalink: "/r/PostgreSQL/comments/abc123/slow_query_plans/m1abcd2/",
    replies: [
      {
        id: "m1abef3",
        author: "ops_sre",
        body: "Also check for missing indexes on join keys. BRIN can help for wide ranges.",
        score: 41,
        created_utc: 1723612890.0,
        permalink: "/r/PostgreSQL/comments/abc123/slow_query_plans/m1abef3/",
        replies: [
          {
            id: "m1abff4",
            author: "OP_user",
            body: "Thanks! Adding an index on (tenant_id, created_at) dropped P95 by ~30%.",
            score: 12,
            created_utc: 1723613402.0,
            permalink: "/r/PostgreSQL/comments/abc123/slow_query_plans/m1abff4/",
            replies: []
          }
        ]
      },
      {
        id: "m1ac001",
        author: "another_dev",
        body: "If you're on 14+, enable JIT only for long-running queries. It can slow short ones.",
        score: 23,
        created_utc: 1723614005.0,
        permalink: "/r/PostgreSQL/comments/abc123/slow_query_plans/m1ac001/",
        replies: []
      },
      {
        id: "m1ac110",
        author: "perf_analyst",
        body: "EXPLAIN (ANALYZE, BUFFERS) is your friend. Share a plan if you can.",
        score: 18,
        created_utc: 1723614550.0,
        permalink: "/r/PostgreSQL/comments/abc123/slow_query_plans/m1ac110/",
        replies: [
          {
            id: "m1ac200",
            author: "db_guru",
            body: "Yep—BUFFERS shows read vs. hit ratios. High reads → missing cache or indexes.",
            score: 9,
            created_utc: 1723615001.0,
            permalink: "/r/PostgreSQL/comments/abc123/slow_query_plans/m1ac200/",
            replies: []
          },
          {
            id: "m1ac2zz",
            author: "query_doc",
            body: "You can paste plans to explain.depesz.com for nicer diffs.",
            score: 6,
            created_utc: 1723615200.0,
            permalink: "/r/PostgreSQL/comments/abc123/slow_query_plans/m1ac2zz/",
            replies: []
          }
        ]
      }
    ]
  };
};

// GET /api/reddit/thread/[threadId] - Get full Reddit thread
export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    // In production, this would fetch from the actual Reddit API
    // For now, return mock data
    const thread = getMockRedditThread(params.threadId);
    
    return NextResponse.json(thread);
  } catch (error) {
    console.error("Error fetching Reddit thread:", error);
    return NextResponse.json(
      { error: "Failed to fetch Reddit thread" },
      { status: 500 }
    );
  }
}