import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

interface UpdateTopicsRequest {
  topics: string[];
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; configId: string }> }
) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { projectId, configId } = await params;

    // Parse request body
    let body: UpdateTopicsRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Validate topics
    if (!Array.isArray(body.topics)) {
      return NextResponse.json(
        { error: "topics must be an array" },
        { status: 400 }
      );
    }

    // Filter and validate topics
    const validTopics = body.topics
      .map((topic: string) => topic.trim())
      .filter((topic: string) => topic.length > 0 && topic.length <= 50);

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

    // Get current configs
    const currentConfigs = projectData?.source?.configs || {};

    // Check if config exists
    if (!currentConfigs[configId]) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    // Update the specific config's topics
    const updatedConfigs = {
      ...currentConfigs,
      [configId]: {
        ...currentConfigs[configId],
        topics: validTopics,
      },
    };

    // Update the project document
    await projectRef.update({
      "source.configs": updatedConfigs,
      updated_at: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        topics: validTopics,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating topics:", error);
    return NextResponse.json(
      {
        error: "Failed to update topics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
