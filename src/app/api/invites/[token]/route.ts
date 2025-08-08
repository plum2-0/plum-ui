import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// Accept an invite by token. Associates current user to the brand and marks invite as used.
export async function POST(request: NextRequest, context: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const firestore = adminDb();
    const userId = session.user.id;
    const token = context?.params?.token as string;

    const inviteRef = firestore.collection("brand_invites").doc(token);
    const inviteDoc = await inviteRef.get();
    if (!inviteDoc.exists) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    const invite = inviteDoc.data() as any;

    // Validate invite
    if (invite.status !== "active") {
      return NextResponse.json(
        { error: "Invite is not active" },
        { status: 400 }
      );
    }
    const now = new Date();
    if (invite.expires_at && invite.expires_at.toDate) {
      if (invite.expires_at.toDate() < now) {
        return NextResponse.json({ error: "Invite expired" }, { status: 400 });
      }
    } else if (invite.expires_at) {
      // In case stored as Date
      if (new Date(invite.expires_at) < now) {
        return NextResponse.json({ error: "Invite expired" }, { status: 400 });
      }
    }

    const usedBy: string[] = Array.isArray(invite.used_by)
      ? invite.used_by
      : [];
    const maxUses: number =
      typeof invite.max_uses === "number" ? invite.max_uses : 1;
    if (usedBy.length >= maxUses) {
      return NextResponse.json(
        { error: "Invite already used" },
        { status: 400 }
      );
    }

    // No email restriction

    const brandId: string = invite.brand_id;

    // Link user to brand: set brand_id on user doc and add to brand.user_ids
    const userRef = firestore.collection("users").doc(userId);
    const brandRef = firestore.collection("brands").doc(brandId);

    await firestore.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const brandSnap = await tx.get(brandRef);
      if (!brandSnap.exists) {
        throw new Error("Brand not found");
      }

      // If user already linked to a brand, allow if same; else error
      const existing = userSnap.exists ? userSnap.data()?.brand_id : null;
      if (existing && existing !== brandId) {
        throw new Error("User already linked to another brand");
      }

      tx.set(
        userRef,
        {
          brand_id: brandId,
          updated_at: new Date(),
        },
        { merge: true }
      );

      // Maintain brand.user_ids for server use
      tx.update(brandRef, {
        user_ids: FieldValue.arrayUnion(userId),
        updated_at: new Date(),
      });

      // Also append a lightweight user profile into brand.users for backend/UI
      const userProfile = {
        name: session.user.name || session.user.email || "",
        image: session.user.image || null,
        auth_type: (session.user as any).provider || "unknown",
        created_at: new Date(),
        updated_at: new Date(),
      };
      tx.update(brandRef, {
        users: FieldValue.arrayUnion(userProfile),
        updated_at: new Date(),
      });

      // Mark invite used
      const newUsedBy = usedBy.includes(userId) ? usedBy : [...usedBy, userId];
      const newStatus = newUsedBy.length >= maxUses ? "consumed" : "active";
      tx.update(inviteRef, {
        used_by: newUsedBy,
        status: newStatus,
        updated_at: new Date(),
      });
    });

    const res = NextResponse.json({ success: true, brandId });
    // Set brand_id cookie so subsequent UI requests pick it up immediately
    try {
      res.cookies.set("brand_id", brandId, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    } catch {}
    return res;
  } catch (error: any) {
    console.error("Error accepting invite:", error);
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
    const token = context?.params?.token as string;
    const inviteRef = firestore.collection("brand_invites").doc(token);
    const inviteDoc = await inviteRef.get();
    if (!inviteDoc.exists) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    const invite = inviteDoc.data() as any;
    const brandId = invite.brand_id as string;
    const brandDoc = await firestore.collection("brands").doc(brandId).get();
    const brand = brandDoc.exists ? brandDoc.data() : null;

    const toIso = (v: any) =>
      v?.toDate
        ? v.toDate().toISOString()
        : v
        ? new Date(v).toISOString()
        : null;

    return NextResponse.json({
      token,
      brandId,
      brandName: brand?.name || null,
      status: invite.status,
      expiresAt: toIso(invite.expires_at),
      maxUses: invite.max_uses ?? 1,
      usedCount: Array.isArray(invite.used_by) ? invite.used_by.length : 0,
    });
  } catch (error) {
    console.error("Error loading invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
