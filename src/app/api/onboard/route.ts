import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

interface BrandOffering {
  title: string;
  description: string;
}

interface OnboardRequest {
  brandName: string;
  website: string;
  brandDescription?: string;
  problems?: string[];
  targetProblems?: string[];
  offerings?: BrandOffering[];
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse request body
    let body: OnboardRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Validate required fields
    if (!body.brandName?.trim() || !body.website?.trim()) {
      return NextResponse.json(
        { error: "Brand name and website are required" },
        { status: 400 }
      );
    }

    // Handle new structure with brandDescription, problems/targetProblems, offerings
    const payload: any = {
      brand_name: body.brandName.trim(),
      brand_website: body.website.trim(),
      user_id: userId,
    };

    // Check if this is the new structure
    if (
      body.brandDescription ||
      body.targetProblems ||
      body.problems ||
      body.offerings
    ) {
      payload.brand_description = body.brandDescription?.trim();
      const requestProblems = (body.problems || body.targetProblems) ?? [];
      payload.problems = requestProblems.filter((p: string) => p?.trim());
      payload.offerings =
        body.offerings?.filter(
          (o: BrandOffering) => o.title?.trim() && o.description?.trim()
        ) || [];
      payload.brand_detail = body.brandDescription?.trim(); // Also set brand_detail for backward compatibility
      if (!payload.problems || payload.problems.length === 0) {
        return NextResponse.json(
          { error: "At least one valid problem is required" },
          { status: 400 }
        );
      }
    }

    // Call the backend API
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/brand/onboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend API error:", errorText);
      return NextResponse.json(
        { error: `Failed to create brand profile: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const brandId = data.brand_id || data.id; // Adapt based on your backend response structure

    // Store brandId in Firestore users collection
    const firestore = adminDb();
    if (firestore && brandId) {
      try {
        const userRef = firestore.collection("users").doc(userId);
        await userRef.set(
          {
            user_id: userId,
            brand_id: brandId,
            updated_at: new Date(),
          },
          { merge: true }
        );
      } catch (firestoreError) {
        console.error("Failed to store brandId in Firestore:", firestoreError);
        // Don't fail the entire request if Firestore update fails
      }
    }

    // Create response with brandId cookie for immediate frontend access
    const response_obj = NextResponse.json({
      success: true,
      message: "Brand profile created successfully",
      data: { ...data, brand_id: brandId },
    });

    // Set brandId cookie for immediate access
    if (brandId) {
      response_obj.cookies.set("brand_id", brandId, {
        httpOnly: false, // Allow frontend access
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      });
    }

    return response_obj;
  } catch (error) {
    console.error("Error creating brand profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
