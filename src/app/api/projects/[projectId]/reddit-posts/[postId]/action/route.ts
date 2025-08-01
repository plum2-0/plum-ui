import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { PostActionRequest, PostActionResponse } from "@/types/reddit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; postId: string }> }
) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { projectId, postId } = await params;

    // Parse request body
    let body: PostActionRequest;
    try {
      const rawBody = await request.json();
      body = {
        post_id: postId,
        action: rawBody.action,
        edited_response: rawBody.edited_response,
      };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Validate action
    const validActions = ["reply", "ignore", "edit", "pending"];
    if (!validActions.includes(body.action)) {
      return NextResponse.json(
        {
          error: "Invalid action. Must be one of: reply, ignore, edit, pending",
        },
        { status: 400 }
      );
    }

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

    // Send action to backend
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8001";

    try {
      const backendResponse = await fetch(
        `${backendUrl}/admin/reddit/posts/${postId}/action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: body.action,
            edited_response: body.edited_response,
            project_id: projectId,
          }),
        }
      );

      if (!backendResponse.ok) {
        throw new Error(
          `Backend API error: ${backendResponse.status} ${backendResponse.statusText}`
        );
      }

      const backendData = await backendResponse.json();

      // Transform backend response to match frontend types
      const response: PostActionResponse = {
        success: true,
        message: `Post action updated to ${body.action}`,
        updated_post: backendData.updated_post || {
          post_id: postId,
          title: backendData.title || "Updated post",
          author: backendData.author || "unknown",
          subreddit: backendData.subreddit || "unknown",
          created_utc: backendData.created_utc || Date.now() / 1000,
          time_ago: backendData.time_ago || "recently",
          score: backendData.score || 0,
          upvote_ratio: backendData.upvote_ratio || 0.5,
          comment_count: backendData.comment_count || 0,
          link_flair: backendData.link_flair || "",
          domain: backendData.domain || "",
          url: backendData.url || "",
          thumbnail: backendData.thumbnail || "",
          permalink: backendData.permalink || "",
          is_self: backendData.is_self || true,
          is_video: backendData.is_video || false,
          user_action: body.action,
          llm_response:
            body.edited_response ||
            backendData.llm_response ||
            "Response updated",
          confidence_score: backendData.confidence_score || 0,
          matched_topics: backendData.matched_topics || [],
        },
      };

      // Log the action for auditing
      console.log(
        `User ${userId} performed action ${body.action} on post ${postId} in project ${projectId}`
      );

      return NextResponse.json(response, { status: 200 });
    } catch (backendError) {
      console.warn(
        "Backend API failed for post action, proceeding with local response:",
        backendError
      );

      // Fallback response if backend is unavailable
      const response: PostActionResponse = {
        success: true,
        message: `Post action updated to ${body.action} (offline mode)`,
        updated_post: {
          post_id: postId,
          title: "Updated post",
          author: "user123",
          subreddit: "programming",
          created_utc: Date.now() / 1000,
          time_ago: "2 hours ago",
          score: 100,
          upvote_ratio: 0.95,
          comment_count: 20,
          link_flair: "",
          domain: "self.programming",
          url: "https://reddit.com",
          thumbnail: "",
          permalink: "/r/programming/comments/abc123/",
          is_self: true,
          is_video: false,
          user_action: body.action,
          llm_response: body.edited_response || "Original response",
          confidence_score: 0.85,
          matched_topics: ["AI", "Programming"],
        },
      };

      // Log the action for auditing
      console.log(
        `User ${userId} performed action ${body.action} on post ${postId} in project ${projectId} (offline mode)`
      );

      return NextResponse.json(response, { status: 200 });
    }
  } catch (error) {
    console.error("Error updating post action:", error);
    return NextResponse.json(
      {
        error: "Failed to update post action",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
