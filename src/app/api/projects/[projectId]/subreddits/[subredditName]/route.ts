import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; subredditName: string }> }
) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { projectId, subredditName } = await params;

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
    const currentSubreddits = projectData?.source?.reddit?.subreddits || [];

    // Check if subreddit exists
    const subredditToRemove = subredditName.toLowerCase();
    if (!currentSubreddits.includes(subredditToRemove)) {
      return NextResponse.json(
        { error: "Subreddit not found" },
        { status: 404 }
      );
    }

    // Remove the subreddit
    const updatedSubreddits = currentSubreddits.filter(
      (sub: string) => sub !== subredditToRemove
    );

    // Update the project document
    await projectRef.update({
      "source.reddit.subreddits": updatedSubreddits,
      updated_at: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        subreddits: updatedSubreddits,
        message: "Subreddit removed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing subreddit:", error);
    return NextResponse.json(
      {
        error: "Failed to remove subreddit",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
