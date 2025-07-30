import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

interface CreateConfigRequest {
  name?: string;
  topics: string[];
  prompt: string;
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
    let body: CreateConfigRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Validate required fields
    if (!Array.isArray(body.topics)) {
      return NextResponse.json(
        { error: "topics must be an array" },
        { status: 400 }
      );
    }

    if (typeof body.prompt !== "string") {
      return NextResponse.json(
        { error: "prompt must be a string" },
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

    // Generate a unique config ID
    const configId = `config_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create the config object
    const config = {
      topics: body.topics.filter((topic: string) => topic.trim()),
      prompt: body.prompt.trim(),
    };

    // Get current configs or initialize empty object
    const currentConfigs = projectData?.source?.configs || {};

    // Add the new config
    const updatedConfigs = {
      ...currentConfigs,
      [configId]: config,
    };

    // Update the project document
    await projectRef.update({
      "source.configs": updatedConfigs,
      updated_at: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        configId,
        config,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating config:", error);
    return NextResponse.json(
      {
        error: "Failed to create config",
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

    // Get current configs
    const configs = projectData?.source?.configs || {};

    return NextResponse.json(
      {
        success: true,
        configs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching configs:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch configs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
