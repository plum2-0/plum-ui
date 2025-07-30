import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
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

    // Get the specific config
    const configs = projectData?.source?.configs || {};
    const config = configs[configId];

    if (!config) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        config,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch config",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Remove the config
    const updatedConfigs = { ...currentConfigs };
    delete updatedConfigs[configId];

    // Update the project document
    await projectRef.update({
      "source.configs": updatedConfigs,
      updated_at: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Configuration deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting config:", error);
    return NextResponse.json(
      {
        error: "Failed to delete config",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
