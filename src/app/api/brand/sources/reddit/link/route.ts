import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { getBrandIdFromRequest } from "@/lib/cookies";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brandId = session.user.brandId || getBrandIdFromRequest(request);
    if (!brandId) {
      return NextResponse.json({ error: "No brand associated with user" }, { status: 400 });
    }

    const { subreddit } = await request.json();
    if (!subreddit) {
      return NextResponse.json({ error: "Subreddit name is required" }, { status: 400 });
    }

    const firestore = adminDb();
    if (!firestore) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }

    // Update brand's Reddit source configuration
    const brandRef = firestore.collection("brands").doc(brandId);
    await brandRef.update({
      "source.reddit.connected_subreddit": subreddit,
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
    console.error("Error linking subreddit:", error);
    return NextResponse.json(
      { error: "Failed to link subreddit" },
      { status: 500 }
    );
  }
}