import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { getProjectIdFromRequest } from "@/lib/cookies";

interface UpdateSourceRequest {
  reddit?: {
    subreddits?: string[];
    keywords?: string[];
  };
}

interface ProjectUser {
  user_id: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse request body
    let body: UpdateSourceRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Validate that we have some source data to update
    if (!body.reddit || (!body.reddit.subreddits && !body.reddit.keywords)) {
      return NextResponse.json(
        { error: "At least one of subreddits or keywords is required" },
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

    // Get projectId from cookie
    const projectId = getProjectIdFromRequest(request);

    if (!projectId) {
      return NextResponse.json(
        { error: "No project found for user" },
        { status: 404 }
      );
    }

    // Get the project to validate it exists and user has access
    const projectRef = firestore.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectData = projectDoc.data();

    // Check if user belongs to the project
    const userBelongsToProject =
      projectData?.users?.some(
        (user: ProjectUser) => user.user_id === userId
      ) || projectData?.user_ids?.includes(userId);

    if (!userBelongsToProject) {
      return NextResponse.json(
        { error: "Access denied to project" },
        { status: 403 }
      );
    }

    // Prepare the update data
    const updateData: Record<string, unknown> = {
      updated_at: Timestamp.now(),
    };

    // Update Reddit source data
    if (body.reddit) {
      if (body.reddit.subreddits !== undefined) {
        updateData["source.reddit.subreddits"] = body.reddit.subreddits;
      }
      if (body.reddit.keywords !== undefined) {
        updateData["source.reddit.keywords"] = body.reddit.keywords;
      }
    }

    // Update the project
    await projectRef.update(updateData);

    // Get the updated project data to return
    const updatedProjectDoc = await projectRef.get();
    const updatedProjectData = updatedProjectDoc.data();

    return NextResponse.json(
      {
        success: true,
        project_id: projectId,
        source: updatedProjectData?.source || {},
        message: "Project source updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating project source:", error);
    return NextResponse.json(
      {
        error: "Failed to update project source",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get Firestore instance
    const firestore = adminDb();
    if (!firestore) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    // Get projectId from cookie
    const projectId = getProjectIdFromRequest(request);

    if (!projectId) {
      return NextResponse.json(
        { error: "No project found for user" },
        { status: 404 }
      );
    }

    // Get the project
    const projectRef = firestore.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectData = projectDoc.data();

    // Check if user belongs to the project
    const userBelongsToProject =
      projectData?.users?.some(
        (user: ProjectUser) => user.user_id === userId
      ) || projectData?.user_ids?.includes(userId);

    if (!userBelongsToProject) {
      return NextResponse.json(
        { error: "Access denied to project" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        project_id: projectId,
        source: projectData?.source || {},
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching project source:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch project source",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
