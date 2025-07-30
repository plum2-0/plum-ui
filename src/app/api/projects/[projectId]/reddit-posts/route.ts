import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { RedditPost, RedditPostsResponse } from "@/types/reddit";

// Mock data for development - replace with actual backend call
const generateMockPosts = (count: number): RedditPost[] => {
  const postTemplates = [
    {
      title: "How do I get started with machine learning as a web developer?",
      subreddit: "learnmachinelearning",
      content: "I've been doing web development for 5 years and want to transition into ML. Where should I start?",
      topics: ["Machine Learning", "Career Advice"],
      llm_response: `Great question! As a web developer, you already have valuable programming skills. Here's a roadmap:

1. **Start with Python**: If you're not familiar, learn Python basics
2. **Learn the fundamentals**: Linear algebra, statistics, and calculus basics
3. **Online courses**: Try Andrew Ng's Coursera course or fast.ai
4. **Hands-on projects**: Start with Kaggle competitions
5. **Web + ML**: Explore TensorFlow.js to leverage your web skills

Your web dev background is actually an advantage - you can build end-to-end ML applications!`,
      confidence_score: 0.92
    },
    {
      title: "My anxiety is ruining my relationship - need advice",
      subreddit: "relationship_advice",
      content: "I constantly worry my partner will leave me, even though they've given me no reason to think this.",
      topics: ["Mental Health", "Relationships"],
      llm_response: `I understand how overwhelming relationship anxiety can be. Here are some strategies that might help:

1. **Acknowledge your feelings**: It's okay to feel anxious, but recognize these are feelings, not facts
2. **Communicate with your partner**: Share your concerns openly and honestly
3. **Practice self-soothing**: Deep breathing, meditation, or journaling can help
4. **Challenge negative thoughts**: Ask yourself "What evidence do I have for this fear?"
5. **Consider therapy**: A therapist can help you work through attachment issues

Remember, vulnerability can actually strengthen relationships when shared appropriately.`,
      confidence_score: 0.88
    },
    {
      title: "Best practices for React performance optimization?",
      subreddit: "reactjs",
      content: "Our React app is getting slower as it grows. What are the most effective optimization techniques?",
      topics: ["React", "Web Development"],
      llm_response: `Here are the most impactful React performance optimizations:

1. **React.memo()**: Wrap components to prevent unnecessary re-renders
2. **useMemo & useCallback**: Memoize expensive calculations and functions
3. **Code splitting**: Use React.lazy() and Suspense for route-based splitting
4. **Virtualization**: For long lists, use react-window or react-virtualized
5. **State management**: Keep state as local as possible, lift only when needed
6. **Production build**: Ensure you're testing with optimized production builds

Pro tip: Use React DevTools Profiler to identify performance bottlenecks before optimizing!`,
      confidence_score: 0.95
    },
    {
      title: "How to implement authentication in Next.js 14?",
      subreddit: "nextjs",
      content: "I'm building a new app with Next.js 14 and need to add authentication. What's the best approach?",
      topics: ["Next.js", "Web Development"],
      llm_response: `For Next.js 14, here are the recommended authentication approaches:

1. **NextAuth.js (Auth.js)**: The most popular solution
   - Supports multiple providers (Google, GitHub, etc.)
   - Works great with App Router
   - Built-in session management

2. **Clerk**: Excellent developer experience
   - Pre-built components
   - Multi-factor authentication
   - User management dashboard

3. **Supabase Auth**: If you're already using Supabase
   - Integrated with database
   - Row-level security

4. **Custom implementation**: Using middleware and JWT
   - More control but more work
   - Good for specific requirements

For most projects, I'd recommend starting with NextAuth.js!`,
      confidence_score: 0.91
    },
    {
      title: "Is TypeScript worth learning in 2024?",
      subreddit: "webdev",
      content: "I'm comfortable with JavaScript but my team wants to switch to TypeScript. Is it worth the effort?",
      topics: ["TypeScript", "Web Development"],
      llm_response: `Absolutely! TypeScript is definitely worth learning in 2024. Here's why:

1. **Industry standard**: Most modern projects use TypeScript
2. **Better developer experience**: Autocomplete, refactoring, and error catching
3. **Easier collaboration**: Types serve as documentation
4. **Gradual adoption**: You can migrate incrementally
5. **Career opportunities**: TS is often required for senior roles

Start small:
- Add TypeScript to one file at a time
- Use 'any' initially, then gradually add proper types
- Learn as you go - you don't need to master everything upfront

The productivity gains are worth the initial learning curve!`,
      confidence_score: 0.89
    }
  ];

  const actions: Array<'pending' | 'reply' | 'ignore' | 'edit'> = ['pending', 'reply', 'ignore', 'edit'];
  const posts: RedditPost[] = [];

  for (let i = 0; i < count; i++) {
    const template = postTemplates[i % postTemplates.length];
    const hoursAgo = Math.floor(Math.random() * 48) + 1;
    const hasParentComment = Math.random() > 0.7;

    posts.push({
      post_id: `post_${Date.now()}_${i}`,
      title: template.title,
      author: `user_${Math.floor(Math.random() * 10000)}`,
      subreddit: template.subreddit,
      created_utc: Math.floor(Date.now() / 1000) - (hoursAgo * 3600),
      time_ago: hoursAgo === 1 ? '1 hour ago' : `${hoursAgo} hours ago`,
      score: Math.floor(Math.random() * 1000) + 50,
      upvote_ratio: 0.7 + Math.random() * 0.3,
      comment_count: Math.floor(Math.random() * 200) + 5,
      link_flair: Math.random() > 0.5 ? ['Question', 'Discussion', 'Help', 'Resource'][Math.floor(Math.random() * 4)] : '',
      domain: `self.${template.subreddit}`,
      url: `https://reddit.com/r/${template.subreddit}/comments/abc${i}/`,
      thumbnail: '',
      permalink: `/r/${template.subreddit}/comments/abc${i}/${template.title.toLowerCase().replace(/\s+/g, '_')}/`,
      is_self: true,
      is_video: false,
      user_action: i < 3 ? 'pending' : actions[i % actions.length],
      llm_response: template.llm_response,
      confidence_score: template.confidence_score + (Math.random() * 0.1 - 0.05),
      matched_topics: template.topics,
      parent_comment: hasParentComment ? {
        id: `comment_${Date.now()}_${i}`,
        author: `commenter_${Math.floor(Math.random() * 1000)}`,
        body: "This is exactly what I was looking for! I've been struggling with the same issue. Did you find any good resources?",
        created_utc: Math.floor(Date.now() / 1000) - ((hoursAgo - 1) * 3600),
        score: Math.floor(Math.random() * 100) + 1,
        parent_id: `t3_abc${i}`,
        permalink: `/r/${template.subreddit}/comments/abc${i}/comment_${i}/`
      } : undefined
    });
  }

  return posts;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { projectId } = await params;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get Firestore instance
    const firestore = adminDb();
    if (!firestore) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    // Verify user has access to the project
    const projectRef = firestore.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectData = projectDoc.data();
    if (!projectData?.user_ids?.includes(userId)) {
      return NextResponse.json(
        { error: "Access denied to project" },
        { status: 403 }
      );
    }

    // TODO: Replace with actual backend API call
    // const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8001';
    // const response = await fetch(`${backendUrl}/admin/reddit/posts/project/${projectId}`);
    // const data = await response.json();

    // For now, return mock data
    const allPosts = generateMockPosts(50);
    let filteredPosts = allPosts;

    if (status === 'pending') {
      filteredPosts = allPosts.filter(post => post.user_action === 'pending');
    } else if (status === 'reviewed') {
      filteredPosts = allPosts.filter(post => post.user_action !== 'pending');
    }

    const paginatedPosts = filteredPosts.slice(offset, offset + limit);

    const response: RedditPostsResponse = {
      success: true,
      posts: paginatedPosts,
      total_count: filteredPosts.length,
      has_more: offset + limit < filteredPosts.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching Reddit posts:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Reddit posts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}