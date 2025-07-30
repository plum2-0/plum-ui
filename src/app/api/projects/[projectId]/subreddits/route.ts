import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

interface AddSubredditRequest {
  subreddit: string;
}

export async function POST(
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

    // Parse request body
    let body: AddSubredditRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Validate subreddit name
    if (!body.subreddit?.trim()) {
      return NextResponse.json(
        { error: "subreddit is required" },
        { status: 400 }
      );
    }

    const subredditName = body.subreddit.trim().toLowerCase();

    // Get Firestore instance
    const firestore = adminDb();
    if (!firestore) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    // Get the project and verify user access
    const projectRef = firestore.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectData = projectDoc.data();

    // Check if user belongs to the project
    if (!projectData?.user_ids?.includes(userId)) {
      return NextResponse.json(
        { error: "Access denied to project" },
        { status: 403 }
      );
    }

    // Get current subreddits or initialize empty array
    const currentSubreddits = projectData?.source?.reddit?.subreddits || [];

    // Check if subreddit already exists
    if (currentSubreddits.includes(subredditName)) {
      return NextResponse.json(
        { error: "Subreddit already added" },
        { status: 400 }
      );
    }

    // Add the new subreddit
    const updatedSubreddits = [...currentSubreddits, subredditName];

    // Update the project document
    await projectRef.update({
      "source.reddit.subreddits": updatedSubreddits,
      updated_at: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        subreddits: updatedSubreddits,
        message: "Subreddit added successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding subreddit:", error);
    return NextResponse.json(
      {
        error: "Failed to add subreddit",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

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

    // Get Firestore instance
    const firestore = adminDb();
    if (!firestore) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    // Get the project and verify user access
    const projectRef = firestore.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectData = projectDoc.data();

    // Check if user belongs to the project
    if (!projectData?.user_ids?.includes(userId)) {
      return NextResponse.json(
        { error: "Access denied to project" },
        { status: 403 }
      );
    }

    // Get current subreddits
    const subreddits = projectData?.source?.reddit?.subreddits || [];

    return NextResponse.json(
      {
        success: true,
        subreddits,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching subreddits:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch subreddits",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
