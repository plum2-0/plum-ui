import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { getBrandIdFromRequest } from "@/lib/cookies";

export async function GET(request: NextRequest) {
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

    // Get brand data to fetch Reddit tokens
    const brandRef = firestore.collection("brands").doc(brandId);
    const brandDoc = await brandRef.get();
    const brandData = brandDoc.data();

    if (!brandData?.source?.reddit?.oauth_token) {
      return NextResponse.json({ error: "Reddit account not connected" }, { status: 400 });
    }

    const accessToken = brandData.source.reddit.oauth_token;

    // Fetch moderated subreddits from Reddit API
    const response = await fetch("https://oauth.reddit.com/subreddits/mine/moderator", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Plum2.0/1.0",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch subreddits from Reddit:", await response.text());
      return NextResponse.json(
        { error: "Failed to fetch subreddits from Reddit" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Format subreddit data
    const subreddits = data.data.children.map((child: any) => ({
      name: child.data.display_name,
      subscribers: child.data.subscribers || 0,
      isModerated: true,
    }));

    return NextResponse.json({ subreddits });
  } catch (error) {
    console.error("Error fetching moderated subreddits:", error);
    return NextResponse.json(
      { error: "Failed to fetch moderated subreddits" },
      { status: 500 }
    );
  }
}