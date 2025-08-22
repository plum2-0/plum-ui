import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

interface OnboardingState {
  currentStep: 1 | 2 | 3 | 4;
  hasProject: boolean;
  projectId: string | null;
  projectName: string | null;
  hasRedditConfig: boolean;
  hasCompleteConfig: boolean;
  redirectTo:
    | "/onboarding"
    | "/onboarding/configure"
    | string;
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

    // Query for user's brands
    const brandsRef = firestore.collection("brands");
    const querySnapshot = await brandsRef
      .where("user_ids", "array-contains", userId)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      console.log("No brand found");
      const state: OnboardingState = {
        currentStep: 1,
        hasProject: false,
        projectId: null,
        projectName: null,
        hasRedditConfig: false,
        hasCompleteConfig: false,
        redirectTo: "/onboarding",
      };
      return NextResponse.json(state, { status: 200 });
    }

    // Brand found

    const brandDoc = querySnapshot.docs[0];
    const brandData = brandDoc.data();

    // Check if brand has Reddit configuration
    const hasRedditConfig = !!brandData.source?.reddit?.oauth_token;

    // Check if brand has complete configuration (subreddits, topics, and prompt)
    const hasSubreddits = brandData.source?.reddit?.subreddits?.length > 0;
    const hasConfigs =
      brandData.source?.configs &&
      Object.keys(brandData.source.configs).length > 0;
    let hasTopicsAndPrompt = false;

    if (hasConfigs) {
      const firstConfig = Object.values(brandData.source.configs)[0] as any;
      hasTopicsAndPrompt =
        firstConfig?.topics?.length > 0 && !!firstConfig?.prompt;
    }

    const hasCompleteConfig =
      hasRedditConfig && hasSubreddits && hasTopicsAndPrompt;

    // Determine current step and redirect location
    const currentStep: 1 | 2 | 3 | 4 = 4;
    const redirectTo: string = `/dashboard/engage`;
    const state: OnboardingState = {
      currentStep,
      hasProject: true, // Keep this name for backward compatibility
      projectId: brandDoc.id, // Actually brand ID now
      projectName: brandData.name || null,
      hasRedditConfig,
      hasCompleteConfig,
      redirectTo,
    };

    // Set cookie for brand ID (using project_id for backward compatibility)
    const response = NextResponse.json(state, { status: 200 });
    response.cookies.set("project_id", brandDoc.id, {
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
