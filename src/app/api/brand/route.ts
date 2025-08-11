import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { getBrandIdFromRequest } from "@/lib/cookies";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("session", session);
    const userId = session.user.id;
    let brandId: string | null = null;

    // Strategy 1: Try to get brandId from session (fastest)
    if (session.user.brandId) {
      brandId = session.user.brandId;
    } else {
      // Strategy 2: Try to get brandId from cookie
      brandId = getBrandIdFromRequest(request);

      if (!brandId) {
        // Strategy 3: Fetch from Firestore (most reliable but slower)
        const firestore = adminDb();
        if (firestore) {
          try {
            const userRef = firestore.collection("users").doc(userId);
            const userDoc = await userRef.get();
            const userData = userDoc.data();

            if (userData?.brand_id) {
              brandId = userData.brand_id;
            }
          } catch (firestoreError) {
            console.error(
              "Failed to fetch brandId from Firestore:",
              firestoreError
            );
          }
        }
      }
    }

    // No brandId found - user hasn't completed onboarding
    if (!brandId) {
      return NextResponse.json(
        {
          error: "Brand not found - user may need to complete onboarding",
          needsOnboarding: true,
        },
        { status: 404 }
      );
    }

    // Fetch brand data from Python backend
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/brand/${brandId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Plum-UI/1.0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend API error:", errorText);

      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "Brand not found",
            needsOnboarding: true,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: `Failed to fetch brand data: ${errorText}` },
        { status: response.status }
      );
    }

    const brandData = await response.json();

    return NextResponse.json({
      success: true,
      brand: brandData,
      brandId,
    });
  } catch (error) {
    console.error("Error fetching brand data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
