import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

type CreateInviteRequest = {
  brandId?: string;
  maxUses?: number;
  expiresInHours?: number; // default 72h
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request
      .json()
      .catch(() => ({}))) as CreateInviteRequest;
    const firestore = adminDb();
    const userId = session.user.id;

    // Resolve brandId: prefer provided, else from session, else from user doc
    let brandId =
      body.brandId || (session.user.brandId as string | null) || null;
    if (!brandId) {
      const userDoc = await firestore.collection("users").doc(userId).get();
      const userData = userDoc.data();
      brandId = userData?.brand_id || null;
    }

    if (!brandId) {
      return NextResponse.json(
        { error: "No brand associated with current user" },
        { status: 400 }
      );
    }

    // Ensure brand exists and verify current user has access
    const [userDoc, brandDoc] = await Promise.all([
      firestore.collection("users").doc(userId).get(),
      firestore.collection("brands").doc(brandId).get(),
    ]);
    if (!brandDoc.exists) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
    const userData = userDoc.data();
    const brandData = brandDoc.data() as any;
    const isMemberByUserDoc = userData?.brand_id === brandId;
    const isMemberBySession = session.user.brandId === brandId;
    const isMemberByBrandDoc = Array.isArray(brandData?.user_ids)
      ? brandData.user_ids.includes(userId)
      : false;
    if (!isMemberByUserDoc && !isMemberBySession && !isMemberByBrandDoc) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this brand" },
        { status: 403 }
      );
    }

    const now = new Date();
    const expiresInHours =
      typeof body.expiresInHours === "number" ? body.expiresInHours : 72;
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
    const maxUses = body.maxUses && body.maxUses > 0 ? body.maxUses : 1;

    // Create invite doc with random id as token
    const invitesCol = firestore.collection("brand_invites");
    const inviteRef = invitesCol.doc();
    const token = inviteRef.id;

    await inviteRef.set({
      brand_id: brandId,
      created_by: userId,
      created_at: now,
      expires_at: expiresAt,
      status: "active",
      max_uses: maxUses,
      used_by: [],
    });

    const origin = request.nextUrl.origin;
    const inviteUrl = `${origin}/invite/${token}`;

    return NextResponse.json({
      success: true,
      token,
      inviteUrl,
      expiresAt: expiresAt.toISOString(),
      maxUses,
      brandId,
    });
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
