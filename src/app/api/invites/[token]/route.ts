import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { InviteService } from "@/services/invite-service";
import { InviteError } from "@/types/invite";

// Accept an invite by token. Associates current user to the brand and marks invite as used.
export async function POST(request: NextRequest, context: any) {
  try {
    const session = await auth();
    console.log("[INVITE_DEBUG] Session in POST:", {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      name: session?.user?.name,
      provider: (session as any)?.user?.provider,
      fullSession: JSON.stringify(session),
    });

    const firestore = adminDb();
    const inviteService = new InviteService(firestore);

    const params = await context?.params;
    const token = params?.token as string;
    console.log("[INVITE_DEBUG] Token:", token);

    // Resolve user ID with fallback
    console.log("[INVITE_DEBUG] Attempting to resolve userId...");
    const userId = await inviteService.resolveUserId(session);
    console.log("[INVITE_DEBUG] Resolved userId:", userId);

    // Create user profile from session
    const userProfile = {
      name: session?.user?.name || (session as any)?.user?.email || null,
      image: session?.user?.image || null,
      auth_type: ((session as any)?.user as any)?.provider || "unknown",
      email: (session?.user?.email || null)?.toLowerCase?.() || null,
    };

    console.log("[INVITE_DEBUG] Calling acceptInvite with:", {
      token,
      userId,
      userProfile,
    });
    const result = await inviteService.acceptInvite(token, userId, userProfile);
    console.log("[INVITE_DEBUG] AcceptInvite result:", result);

    // Verify the data was actually written to the database
    const userDoc = await firestore.collection("users").doc(userId).get();
    const userExists = userDoc.exists;
    const userData = userExists ? userDoc.data() : null;
    console.log("[INVITE_DEBUG] User verification:", {
      userId,
      userExists,
      userData,
      hasBrandId: !!userData?.brand_id,
    });

    if (result.brandId) {
      const brandDoc = await firestore
        .collection("brands")
        .doc(result.brandId)
        .get();
      const brandExists = brandDoc.exists;
      const brandData = brandExists ? brandDoc.data() : null;
      console.log("[INVITE_DEBUG] Brand verification:", {
        brandId: result.brandId,
        brandExists,
        userIdsInBrand: brandData?.user_ids,
        userInBrand: brandData?.user_ids?.includes(userId),
      });
    }

    const res = NextResponse.json(result);
    // Set brand_id cookie so subsequent UI requests pick it up immediately
    try {
      res.cookies.set("brand_id", result.brandId, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      // Also set project_id cookie with brand ID for backward compatibility
      res.cookies.set("project_id", result.brandId, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    } catch {}
    return res;
  } catch (error: any) {
    console.error("[INVITE_DEBUG] Error in POST handler:", error);
    if (error instanceof InviteError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    const message =
      typeof error?.message === "string"
        ? error.message
        : "Internal server error";
    const status = message.includes("another brand") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Fetch invite metadata (brand, status) for the landing page
export async function GET(request: NextRequest, context: any) {
  try {
    const firestore = adminDb();
    const inviteService = new InviteService(firestore);
    const params = await context?.params;
    const token = params?.token as string;

    const metadata = await inviteService.getInviteMetadata(token);

    return NextResponse.json(metadata);
  } catch (error: any) {
    console.error("Error loading invite:", error);

    if (error instanceof InviteError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
