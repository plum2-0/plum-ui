import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { getBrandIdFromRequest } from "@/lib/cookies";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brandId = session.user.brandId || getBrandIdFromRequest(request);
    if (!brandId) {
      return NextResponse.json({ error: "No brand associated with user" }, { status: 400 });
    }

    const body = await request.json();
    const firestore = adminDb();

    if (!firestore) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }

    // Update brand in Firestore
    const brandRef = firestore.collection("brands").doc(brandId);
    const updateData: any = {};

    // Only update fields that were provided
    if (body.name !== undefined) updateData.name = body.name;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.description !== undefined) updateData.detail = body.description;
    if (body.keywords !== undefined) updateData.keywords = body.keywords;
    if (body.voice !== undefined) updateData.voice = body.voice;

    updateData.updated_at = new Date();

    await brandRef.update(updateData);

    // Fetch updated brand data
    const brandDoc = await brandRef.get();
    const brandData = brandDoc.data();

    return NextResponse.json({ 
      brand: {
        id: brandId,
        ...brandData
      }
    });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: "Failed to update brand information" },
      { status: 500 }
    );
  }
}