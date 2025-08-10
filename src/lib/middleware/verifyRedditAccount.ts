import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { getBrandIdFromRequest } from "@/lib/cookies";

export type VerifyRedditAccountErrorCode =
  | "UNAUTHORIZED"
  | "BRAND_NOT_FOUND"
  | "REDDIT_NOT_CONNECTED";

export interface VerifyRedditAccountOk {
  ok: true;
  brandId: string;
  reddit?: {
    username?: string;
    expiresAt?: number;
  };
}

export interface VerifyRedditAccountError {
  ok: false;
  status: number;
  error: VerifyRedditAccountErrorCode;
  message: string;
  needsOnboarding?: boolean;
  needsRedditAuth?: boolean;
}

export async function verifyRedditAccount(
  request: NextRequest
): Promise<VerifyRedditAccountOk | VerifyRedditAccountError> {
  // 1) Require auth
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false,
      status: 401,
      error: "UNAUTHORIZED",
      message: "User is not authenticated",
    };
  }

  const userId = session.user.id;

  // 2) Resolve brandId (session → cookie → Firestore)
  let brandId: string | null = session.user.brandId || null;
  if (!brandId) {
    brandId = getBrandIdFromRequest(request);
  }

  if (!brandId) {
    const firestore = adminDb();
    if (firestore) {
      try {
        const userRef = firestore.collection("users").doc(userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        if (userData?.brand_id) {
          brandId = userData.brand_id as string;
        }
      } catch (err) {
        // If Firestore lookup fails, proceed to report not found below
        // but keep logging for observability
        console.error("Failed to read brandId from Firestore:", err);
      }
    }
  }

  if (!brandId) {
    return {
      ok: false,
      status: 404,
      error: "BRAND_NOT_FOUND",
      message: "Brand not found for user. Onboarding may be required.",
      needsOnboarding: true,
    };
  }

  // 3) Validate Reddit source under brands/{brandId}
  const firestore = adminDb();
  if (!firestore) {
    // If DB is unavailable, treat as not connected for client UX
    return {
      ok: false,
      status: 503,
      error: "REDDIT_NOT_CONNECTED",
      message: "Database not available",
      needsRedditAuth: true,
    };
  }

  const brandRef = firestore.collection("brands").doc(brandId);
  const brandDoc = await brandRef.get();

  let reddit: any = null;
  if (brandDoc.exists) {
    const brandData = brandDoc.data() as any;
    reddit = brandData?.source?.reddit || null;
  }

  const oauthToken = reddit?.oauth_token as string | undefined;
  const expiresAt = reddit?.oauth_token_expires_at as number | undefined;

  // Server will handle refresh; only check presence of credentials
  if (!oauthToken) {
    return {
      ok: false,
      status: 428, // Precondition Required
      error: "REDDIT_NOT_CONNECTED",
      message: "Reddit account not connected",
      needsRedditAuth: true,
    };
  }

  return {
    ok: true,
    brandId,
    reddit: {
      username: reddit?.username,
      expiresAt,
    },
  };
}
