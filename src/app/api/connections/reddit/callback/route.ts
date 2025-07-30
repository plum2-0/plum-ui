import { NextRequest, NextResponse } from "next/server";
import { createTokenEncryption } from "@/lib/crypto";
import {
  findOrCreateProject,
  updateProjectRedditCredentials,
} from "@/lib/project-utils";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token: string;
}

interface RedditUserResponse {
  name: string;
  id: string;
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.id) {
      console.error("User not authenticated");
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle errors from Reddit
    if (error) {
      console.error("Reddit OAuth error:", error);
      return NextResponse.redirect(
        new URL("/onboarding?error=reddit_denied", request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/onboarding?error=invalid_request", request.url)
      );
    }

    const userId = session.user.id;

    // Exchange code for tokens
    const clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Reddit OAuth credentials not configured");
      return NextResponse.redirect(
        new URL("/onboarding?error=configuration_error", request.url)
      );
    }

    // Prepare token request
    const tokenUrl = "https://www.reddit.com/api/v1/access_token";
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Plum2.0/1.0",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/connections/reddit/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      console.error(
        "Failed to exchange code for tokens:",
        await tokenResponse.text()
      );
      return NextResponse.redirect(
        new URL("/onboarding?error=token_exchange_failed", request.url)
      );
    }

    const tokens: RedditTokenResponse = await tokenResponse.json();

    // Get Reddit user info
    const userResponse = await fetch("https://oauth.reddit.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "User-Agent": "Plum2.0/1.0",
      },
    });

    if (!userResponse.ok) {
      console.error(
        "Failed to get Reddit user info:",
        await userResponse.text()
      );
      return NextResponse.redirect(
        new URL("/onboarding?error=user_info_failed", request.url)
      );
    }

    const redditUser: RedditUserResponse = await userResponse.json();

    // Encrypt tokens
    const encryption = createTokenEncryption();
    const encryptedAccessToken = encryption.encrypt(tokens.access_token);
    const encryptedRefreshToken = encryption.encrypt(tokens.refresh_token);

    // Find or create project for user
    const projectName = request.cookies.get("project_name")?.value;
    const projectId = await findOrCreateProject(userId, projectName);

    // Update project with Reddit credentials
    await updateProjectRedditCredentials(projectId, {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      username: redditUser.name,
    });

    // Store projectId in user document for API access
    const firestore = adminDb();
    if (firestore) {
      const userRef = firestore.collection("users").doc(userId);
      await userRef.set(
        {
          user_id: userId,
          project_id: projectId,
          updated_at: Timestamp.now(),
        },
        { merge: true }
      );
    }

    // Clear OAuth cookies and set project cookie
    const response = NextResponse.redirect(
      new URL("/onboarding/reddit?reddit=connected", request.url)
    );
    response.cookies.delete("reddit_oauth_state");

    // Store projectId in secure cookie for frontend access
    response.cookies.set("project_id", projectId, {
      httpOnly: false, // Allow frontend access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Reddit OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/onboarding?error=callback_error", request.url)
    );
  }
}
