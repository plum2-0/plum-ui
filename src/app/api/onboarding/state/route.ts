import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

interface OnboardingState {
  currentStep: 1 | 2 | 3;
  hasProject: boolean;
  projectId: string | null;
  projectName: string | null;
  hasRedditConfig: boolean;
  redirectTo: "/onboarding" | "/onboarding/reddit" | "/onboarding/configure";
}

export async function GET() {
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

    // Query for user's projects
    const projectsRef = firestore.collection("projects");
    const querySnapshot = await projectsRef
      .where("user_ids", "array-contains", userId)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      console.log("No project found");
      // Also check the legacy user_ids field
      const state: OnboardingState = {
        currentStep: 1,
        hasProject: false,
        projectId: null,
        projectName: null,
        hasRedditConfig: false,
        redirectTo: "/onboarding",
      };
      return NextResponse.json(state, { status: 200 });
    }

    // Project found

    const projectDoc = querySnapshot.docs[0];
    const projectData = projectDoc.data();
    console.log(JSON.stringify(projectData, null, 2));

    // Check if project has Reddit configuration
    const hasRedditConfig = !!projectData.source?.reddit?.oauth_token;

    // Determine current step and redirect location
    let currentStep: 1 | 2 | 3;
    let redirectTo:
      | "/onboarding"
      | "/onboarding/reddit"
      | "/onboarding/configure";

    if (!hasRedditConfig) {
      currentStep = 2;
      redirectTo = "/onboarding/reddit";
    } else {
      currentStep = 3;
      redirectTo = "/onboarding/configure";
    }

    const state: OnboardingState = {
      currentStep,
      hasProject: true,
      projectId: projectDoc.id,
      projectName: projectData.project_name || null,
      hasRedditConfig,
      redirectTo,
    };

    // Set cookie for project ID
    const response = NextResponse.json(state, { status: 200 });
    response.cookies.set("project_id", projectDoc.id, {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Error checking onboarding state:", error);
    return NextResponse.json(
      {
        error: "Failed to check onboarding state",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
