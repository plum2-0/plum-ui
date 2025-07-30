import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Reddit OAuth configuration
    const clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "Reddit client ID not configured" },
        { status: 500 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString("base64url");

    // Store state in a secure HTTP-only cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("reddit_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    // Reddit OAuth parameters
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      state: state,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/connections/reddit/callback`,
      duration: "permanent", // Request refresh token
      scope:
        "identity edit flair history modconfig modflair modlog modposts modwiki mysubreddits privatemessages read report save submit subscribe vote wikiedit wikiread",
    });

    // Generate Reddit authorization URL
    const authUrl = `https://www.reddit.com/api/v1/authorize?${params.toString()}`;

    // Return the authorization URL
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Error generating Reddit OAuth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}
