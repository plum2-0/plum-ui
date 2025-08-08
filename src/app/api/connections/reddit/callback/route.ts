import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { getBrandIdFromRequest } from "@/lib/cookies";

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
        new URL("/onboarding/reddit?error=reddit_denied", request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/onboarding/reddit?error=invalid_request", request.url)
      );
    }

    const userId = session.user.id;

    // Exchange code for tokens
    const clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Reddit OAuth credentials not configured");
      return NextResponse.redirect(
        new URL("/onboarding/reddit?error=configuration_error", request.url)
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
        new URL("/onboarding/reddit?error=token_exchange_failed", request.url)
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
        new URL("/onboarding/reddit?error=user_info_failed", request.url)
      );
    }

    const redditUser: RedditUserResponse = await userResponse.json();

    // Resolve brandId (session → cookie → Firestore)
    let brandId: string | null = session.user.brandId || null;
    if (!brandId) {
      brandId = getBrandIdFromRequest(request);
    }

    const firestore = adminDb();
    if (!brandId && firestore) {
      try {
        const userRef = firestore.collection("users").doc(userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        if (userData?.brand_id) {
          brandId = userData.brand_id as string;
        }
      } catch (err) {
        console.error("Failed to lookup brandId for user:", err);
      }
    }

    if (!brandId) {
      return NextResponse.redirect(
        new URL("/onboarding?error=brand_not_found", request.url)
      );
    }

    // Persist Reddit credentials under brand
    if (!firestore) {
      return NextResponse.redirect(
        new URL("/onboarding/reddit?error=db_unavailable", request.url)
      );
    }

    const brandRef = firestore.collection("brands").doc(brandId);
    await brandRef.set(
      {
        brand_id: brandId,
        source: {
          reddit: {
            oauth_token: tokens.access_token,
            oauth_token_expires_at: Date.now() + tokens.expires_in * 1000,
            refresh_token: tokens.refresh_token,
            username: redditUser.name,
          },
        },
        updated_at: Timestamp.now(),
      },
      { merge: true }
    );

    // Clear OAuth cookies and set brand cookie
    const response = NextResponse.redirect(
      new URL("/onboarding/reddit?reddit=connected", request.url)
    );
    response.cookies.delete("reddit_oauth_state");
    response.cookies.set("brand_id", brandId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Reddit OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/onboarding/reddit?error=callback_error", request.url)
    );
  }
}
