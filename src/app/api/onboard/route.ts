import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

// Set maximum timeout duration (800s for Pro/Enterprise, 300s for Hobby)
export const maxDuration = 300;

interface BrandOffering {
  title: string;
  description: string;
}

interface OnboardRequest {
  brand_name: string;
  brand_website?: string;
  brand_description?: string;
  problems?: string[];
  offerings?: BrandOffering[];
  keywords?: string[];
  user_id: string;
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
    if (!body.brand_name?.trim()) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    if (!body.user_id?.trim()) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate that we have problems
    if (!body.problems || body.problems.length === 0) {
      return NextResponse.json(
        { error: "At least one problem is required" },
        { status: 400 }
      );
    }

    // Build the payload - the request is already in the correct snake_case format
    const payload: any = {
      brand_name: body.brand_name.trim(),
      brand_website: body.brand_website?.trim() || null,
      brand_description: body.brand_description?.trim() || null,
      problems: body.problems.filter((p: string) => p?.trim()),
      offerings:
        body.offerings?.filter(
          (o: BrandOffering) => o.title?.trim() && o.description?.trim()
        ) || [],
      keywords: body.keywords?.filter((k: string) => k?.trim()) || [],
      user_id: body.user_id.trim(),
    };

    // Set brand_detail for backward compatibility if needed
    if (payload.brand_description) {
      payload.brand_detail = payload.brand_description;
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
