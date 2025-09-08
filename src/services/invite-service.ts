import { Firestore, FieldValue } from "firebase-admin/firestore";
import {
  Invite,
  UserProfile,
  InviteAcceptanceResult,
  InviteError,
} from "@/types/invite";

export class InviteService {
  constructor(private firestore: Firestore) {}

  /**
   * Validates an invite and checks if it can be used
   */
  async validateInvite(token: string): Promise<Invite> {
    const inviteRef = this.firestore.collection("brand_invites").doc(token);
    const inviteDoc = await inviteRef.get();

    if (!inviteDoc.exists) {
      throw new InviteError("Invite not found", 404);
    }

    const invite = inviteDoc.data() as Invite;

    // Check if invite is active
    if (invite.status !== "active") {
      throw new InviteError("Invite is not active", 400);
    }

    // Check if invite is expired
    const now = new Date();
    if (invite.expires_at) {
      let expiryDate: Date;

      if (
        invite.expires_at &&
        typeof invite.expires_at === "object" &&
        "toDate" in invite.expires_at
      ) {
        // Firestore Timestamp
        expiryDate = (
          invite.expires_at as FirebaseFirestore.Timestamp
        ).toDate();
      } else {
        // Regular Date
        expiryDate = new Date(invite.expires_at);
      }

      if (expiryDate < now) {
        throw new InviteError("Invite expired", 400);
      }
    }

    // Check if invite has been used up
    const usedBy: string[] = Array.isArray(invite.used_by)
      ? invite.used_by
      : [];
    const maxUses: number =
      typeof invite.max_uses === "number" ? invite.max_uses : 1;

    if (usedBy.length >= maxUses) {
      throw new InviteError("Invite already used", 400);
    }

    return invite;
  }

  /**
   * Resolves user ID from session, with email fallback
   */
  async resolveUserId(session: any): Promise<string> {
    console.log("[INVITE_DEBUG] resolveUserId - input session:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      email: session?.user?.email,
      sessionKeys: session ? Object.keys(session) : [],
      userKeys: session?.user ? Object.keys(session.user) : [],
    });

    let userId = session?.user?.id as string | undefined;

    if (!userId) {
      console.log(
        "[INVITE_DEBUG] No userId in session, attempting email fallback"
      );
      // Fallback: resolve userId by email from NextAuth users collection
      try {
        const email = session?.user?.email as string | undefined;
        console.log("[INVITE_DEBUG] Email for fallback:", email);
        if (email) {
          const snap = await this.firestore
            .collection("users")
            .where("email", "==", email)
            .limit(1)
            .get();

          console.log("[INVITE_DEBUG] Email query result:", {
            empty: snap.empty,
            docCount: snap.docs.length,
            firstDocId: !snap.empty ? snap.docs[0].id : null,
          });

          if (!snap.empty) {
            userId = snap.docs[0].id;
            console.warn("[InviteService] Resolved userId by email fallback", {
              email,
              userId,
            });
          } else {
            console.log("[INVITE_DEBUG] No user found with email:", email);
          }
        }
      } catch (e) {
        console.error("[InviteService] Failed fallback userId lookup", e);
      }
    }

    if (!userId) {
      console.error("[INVITE_DEBUG] Failed to resolve userId - throwing error");
      throw new InviteError("Unauthorized", 401);
    }

    return userId;
  }

  /**
   * Accepts an invite and links user to brand
   */
  async acceptInvite(
    token: string,
    userId: string,
    userProfile: UserProfile
  ): Promise<InviteAcceptanceResult> {
    // First validate the invite
    const invite = await this.validateInvite(token);

    const brandId = invite.brand_id;
    const usedBy: string[] = Array.isArray(invite.used_by)
      ? invite.used_by
      : [];
    const maxUses: number =
      typeof invite.max_uses === "number" ? invite.max_uses : 1;

    // Execute the transaction
    console.log("[InviteService] Starting transaction", {
      token,
      userId,
      brandId,
    });

    try {
      await this.firestore.runTransaction(async (tx) => {
        console.log("[INVITE_DEBUG] Inside transaction");
        const userRef = this.firestore.collection("users").doc(userId);
        const brandRef = this.firestore.collection("brands").doc(brandId);
        const inviteRef = this.firestore.collection("brand_invites").doc(token);

        // 1. Check if brand exists
        const brandSnap = await tx.get(brandRef);
        console.log("[INVITE_DEBUG] Brand check:", {
          brandId,
          exists: brandSnap.exists,
        });
        if (!brandSnap.exists) {
          throw new InviteError("Brand not found", 404);
        }

        // 2. Check if user already linked to a different brand
        const userSnap = await tx.get(userRef);
        const userData = userSnap.exists ? (userSnap.data() as any) : null;
        const existingBrandIds: string[] = Array.isArray(userData?.brand_ids)
          ? userData.brand_ids
          : userData?.brand_id
          ? [userData.brand_id]
          : [];
        const alreadyInBrand = existingBrandIds.includes(brandId);
        console.log("[INVITE_DEBUG] User check:", {
          userId,
          exists: userSnap.exists,
          existingBrandIds,
          alreadyInBrand,
          userData,
        });

        // 3. Update user document with brand_ids array and profile info
        const updateData = {
          brand_ids: FieldValue.arrayUnion(brandId),
          name: userProfile.name,
          image: userProfile.image,
          auth_type: userProfile.auth_type,
          ...(userProfile.email ? { email: userProfile.email } : {}),
          updated_at: new Date(),
        } as Record<string, any>;
        console.log("[INVITE_DEBUG] Setting user data:", {
          userId,
          updateData,
        });
        tx.set(userRef, updateData, { merge: true });

        // 4. Add user to brand's user_ids array (automatically deduplicates)
        console.log("[INVITE_DEBUG] Adding user to brand's user_ids:", userId);
        tx.update(brandRef, {
          user_ids: FieldValue.arrayUnion(userId),
          updated_at: new Date(),
        });

        // 5. Mark invite as used
        const newUsedBy = usedBy.includes(userId)
          ? usedBy
          : [...usedBy, userId];
        const newStatus = newUsedBy.length >= maxUses ? "consumed" : "active";

        tx.update(inviteRef, {
          used_by: newUsedBy,
          status: newStatus,
          updated_at: new Date(),
        });

        console.log("[InviteService] Transaction completed successfully", {
          token,
          userId,
          brandId,
          usedCount: newUsedBy.length,
          status: newStatus,
        });
      });
    } catch (txError: any) {
      console.error("[INVITE_DEBUG] Transaction failed:", {
        error: txError,
        message: txError?.message,
        stack: txError?.stack,
      });
      throw txError;
    }

    console.log("[InviteService] Transaction committed, verifying data...");

    // Verify the data was written
    const verifyUserDoc = await this.firestore
      .collection("users")
      .doc(userId)
      .get();
    const verifyBrandDoc = await this.firestore
      .collection("brands")
      .doc(brandId)
      .get();

    console.log("[InviteService] Post-transaction verification", {
      userExists: verifyUserDoc.exists,
      userBrandIds: verifyUserDoc.exists
        ? verifyUserDoc.data()?.brand_ids
        : null,
      brandUserIds: verifyBrandDoc.exists
        ? verifyBrandDoc.data()?.user_ids
        : null,
    });

    return {
      success: true,
      brandId,
    };
  }

  /**
   * Gets invite metadata for display purposes
   */
  async getInviteMetadata(token: string) {
    const inviteRef = this.firestore.collection("brand_invites").doc(token);
    const inviteDoc = await inviteRef.get();

    if (!inviteDoc.exists) {
      throw new InviteError("Invite not found", 404);
    }

    const invite = inviteDoc.data() as Invite;
    const brandId = invite.brand_id;

    const brandDoc = await this.firestore
      .collection("brands")
      .doc(brandId)
      .get();
    const brand = brandDoc.exists ? brandDoc.data() : null;

    const toIso = (v: any) =>
      v?.toDate
        ? v.toDate().toISOString()
        : v
        ? new Date(v).toISOString()
        : null;

    return {
      token,
      brandId,
      brandName: brand?.name || null,
      status: invite.status,
      expiresAt: toIso(invite.expires_at),
      maxUses: invite.max_uses ?? 1,
      usedCount: Array.isArray(invite.used_by) ? invite.used_by.length : 0,
    };
  }
}
