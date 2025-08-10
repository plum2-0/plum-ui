import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { getBrandIdFromRequest } from "@/lib/cookies";
import { FieldValue } from "firebase-admin/firestore";

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brandId = session.user.brandId || getBrandIdFromRequest(request);
    if (!brandId) {
      return NextResponse.json({ error: "No brand associated with user" }, { status: 400 });
    }

    const firestore = adminDb();
    if (!firestore) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }

    // Remove Reddit source configuration from brand
    const brandRef = firestore.collection("brands").doc(brandId);
    await brandRef.update({
      "source.reddit": FieldValue.delete(),
      updated_at: new Date(),
    });

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
    console.error("Error disconnecting Reddit:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Reddit account" },
      { status: 500 }
    );
  }
}