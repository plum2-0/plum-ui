import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

interface CreateProjectRequest {
  project_name: string;
  description?: string;
}

interface Project {
  project_name: string;
  description: string;
  user_ids: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
  status: string;
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
    let body: CreateProjectRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Validate required fields
    if (!body.project_name?.trim()) {
      return NextResponse.json(
        { error: "project_name is required" },
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

    // Create the project document
    const projectData: Project = {
      project_name: body.project_name.trim(),
      description: body.description?.trim() || "",
      user_ids: [userId],
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
      status: "active",
    };

    // Start a transaction to ensure both operations succeed or fail together
    const result = await firestore.runTransaction(async (transaction) => {
      const userRef = firestore.collection("users").doc(userId);
      const userDoc = await transaction.get(userRef);
      const projectRef = firestore.collection("projects").doc();
      transaction.set(projectRef, projectData);

      if (userDoc.exists) {
        transaction.set(userRef, {
          user_id: userId,
          project_id: projectRef.id,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        });
      }

      return { projectId: projectRef.id, projectData };
    });

    return NextResponse.json(
      {
        success: true,
        project_id: result.projectId,
        project: {
          ...result.projectData,
          project_id: result.projectId,
        },
        message: "Project created successfully and user updated",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      {
        error: "Failed to create project",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
