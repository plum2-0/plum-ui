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

    const userId = session.user.id;
    let brandId: string | null = null;

    // Strategy 1: Try to get brandId from session (fastest)
    if (session.user.brandId) {
      brandId = session.user.brandId;
      return NextResponse.json({
        brandId,
        source: "session",
      });
    }

    // Strategy 2: Try to get brandId from cookie
    brandId = getBrandIdFromRequest(request);
    if (brandId) {
      return NextResponse.json({
        brandId,
        source: "cookie",
      });
    }

    // Strategy 3: Fetch from Firestore (most reliable but slower)
    const firestore = adminDb();
    if (firestore) {
      try {
        const userRef = firestore.collection("users").doc(userId);
        const userDoc = await userRef.get();
        const userData: any = userDoc.data();
        const userBrandIds: string[] = Array.isArray(userData?.brand_ids)
          ? userData.brand_ids
          : userData?.brand_id
          ? [userData.brand_id]
          : [];

        if (userBrandIds.length > 0) {
          // If cookie brandId exists and is among user's brands, prefer it
          const cookiePreferred = getBrandIdFromRequest(request);
          const selected =
            cookiePreferred && userBrandIds.includes(cookiePreferred)
              ? cookiePreferred
              : userBrandIds[0];
          return NextResponse.json({
            brandId: selected,
            source: "firestore",
          });
        }
      } catch (firestoreError) {
        console.error(
          "Failed to fetch brandId from Firestore:",
          firestoreError
        );
      }
    }

    // No brandId found - user hasn't completed onboarding
    return NextResponse.json({
      brandId: null,
      source: "none",
      message: "Brand not found - user may need to complete onboarding",
    });
  } catch (error) {
    console.error("Error fetching user brand:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
