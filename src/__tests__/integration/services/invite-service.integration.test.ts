/**
 * @jest-environment node
 */

import { Timestamp } from "firebase-admin/firestore";
import { InviteService } from "@/services/invite-service";
import { InviteError } from "@/types/invite";
import { adminDb } from "@/lib/firebase-admin";

describe("InviteService Integration Tests", () => {
  let inviteService: InviteService;
  let firestore: any;
  const testDataIds: string[] = [];

  beforeAll(async () => {
    // Use the real Firebase instance
    firestore = adminDb();
    inviteService = new InviteService(firestore);
  });

  //   beforeEach(async () => {
  //     // Clear any test data from previous runs
  //     await cleanupTestData();
  //   });

  afterAll(async () => {
    // Skip cleanup to allow database inspection
    console.log(
      "🔍 Skipping cleanup - test data left in database for inspection"
    );
    console.log("📋 Test data IDs created:", testDataIds);
  });

  // Helper function to clean up test data
  async function cleanupTestData() {
    const batch = firestore.batch();

    // Clean up test invites
    const inviteSnapshot = await firestore
      .collection("brand_invites")
      .where("brand_id", ">=", "test-")
      .where("brand_id", "<", "test-\uf8ff")
      .get();

    inviteSnapshot.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });

    // Clean up test brands
    const brandSnapshot = await firestore
      .collection("brands")
      .where("name", ">=", "Test ")
      .where("name", "<", "Test \uf8ff")
      .get();

    brandSnapshot.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });

    // Clean up test users
    const userSnapshot = await firestore
      .collection("users")
      .where("name", ">=", "Test ")
      .where("name", "<", "Test \uf8ff")
      .get();

    userSnapshot.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });

    // Also clean up by specific test IDs we track
    for (const id of testDataIds) {
      if (id.startsWith("test-brand-")) {
        batch.delete(firestore.collection("brands").doc(id));
      } else if (id.startsWith("test-user-")) {
        batch.delete(firestore.collection("users").doc(id));
      } else if (id.includes("token")) {
        batch.delete(firestore.collection("brand_invites").doc(id));
      }
    }

    await batch.commit();
    testDataIds.length = 0; // Clear the array
  }

  describe("validateInvite", () => {
    it("should validate an active invite successfully", async () => {
      // Create test data
      const brandId = "test-brand-123";
      const token = "valid-token-123";
      testDataIds.push(brandId, token);

      await firestore
        .collection("brand_invites")
        .doc(token)
        .set({
          brand_id: brandId,
          status: "active",
          expires_at: Timestamp.fromDate(
            new Date(Date.now() + 24 * 60 * 60 * 1000)
          ), // 24 hours from now
          used_by: [],
          max_uses: 1,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        });

      const invite = await inviteService.validateInvite(token);

      expect(invite.brand_id).toBe(brandId);
      expect(invite.status).toBe("active");
      expect(invite.used_by).toEqual([]);
    });

    it("should throw error for non-existent invite", async () => {
      await expect(
        inviteService.validateInvite("non-existent-token")
      ).rejects.toThrow(new InviteError("Invite not found", 404));
    });

    it("should throw error for inactive invite", async () => {
      const token = "inactive-token";
      testDataIds.push(token);

      await firestore
        .collection("brand_invites")
        .doc(token)
        .set({
          brand_id: "test-brand",
          status: "consumed",
          used_by: ["user1"],
          max_uses: 1,
        });

      await expect(inviteService.validateInvite(token)).rejects.toThrow(
        new InviteError("Invite is not active", 400)
      );
    });

    it("should throw error for expired invite", async () => {
      const token = "expired-token";
      testDataIds.push(token);

      await firestore
        .collection("brand_invites")
        .doc(token)
        .set({
          brand_id: "test-brand",
          status: "active",
          expires_at: Timestamp.fromDate(
            new Date(Date.now() - 24 * 60 * 60 * 1000)
          ), // 24 hours ago
          used_by: [],
          max_uses: 1,
        });

      await expect(inviteService.validateInvite(token)).rejects.toThrow(
        new InviteError("Invite expired", 400)
      );
    });

    it("should throw error for fully used invite", async () => {
      const token = "used-token";
      testDataIds.push(token);

      await firestore
        .collection("brand_invites")
        .doc(token)
        .set({
          brand_id: "test-brand",
          status: "active",
          used_by: ["user1"],
          max_uses: 1,
        });

      await expect(inviteService.validateInvite(token)).rejects.toThrow(
        new InviteError("Invite already used", 400)
      );
    });
  });

  describe("resolveUserId", () => {
    it("should return userId directly if present in session", async () => {
      const session = {
        user: { id: "direct-user-123" },
      };

      const userId = await inviteService.resolveUserId(session);
      expect(userId).toBe("direct-user-123");
    });

    it("should resolve userId by email fallback", async () => {
      const email = "test@example.com";
      const userId = "fallback-user-123";
      testDataIds.push(userId);

      // Create user document in Firestore
      await firestore.collection("users").doc(userId).set({
        email: email,
        name: "Test User",
      });

      const session = {
        user: { email: email },
      };

      const resolvedUserId = await inviteService.resolveUserId(session);
      expect(resolvedUserId).toBe(userId);
    });

    it("should throw error for unauthorized session", async () => {
      const session = {};

      await expect(inviteService.resolveUserId(session)).rejects.toThrow(
        new InviteError("Unauthorized", 401)
      );
    });

    it("should throw error when email fallback fails", async () => {
      const session = {
        user: { email: "nonexistent@example.com" },
      };

      await expect(inviteService.resolveUserId(session)).rejects.toThrow(
        new InviteError("Unauthorized", 401)
      );
    });
  });

  describe("acceptInvite", () => {
    let brandId: string;
    let userId: string;
    let token: string;
    let userProfile: any;

    beforeEach(async () => {
      brandId = "test-brand-123";
      userId = "test-user-123";
      token = "test-token-123";
      testDataIds.push(brandId, userId, token);

      userProfile = {
        name: "Test User",
        image: "https://example.com/avatar.jpg",
        auth_type: "google",
      };

      // Create brand
      await firestore.collection("brands").doc(brandId).set({
        name: "Test Brand",
        user_ids: [],
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      // Create invite
      await firestore
        .collection("brand_invites")
        .doc(token)
        .set({
          brand_id: brandId,
          status: "active",
          expires_at: Timestamp.fromDate(
            new Date(Date.now() + 24 * 60 * 60 * 1000)
          ),
          used_by: [],
          max_uses: 1,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        });
    });

    it("should successfully accept invite and link user to brand", async () => {
      const result = await inviteService.acceptInvite(
        token,
        userId,
        userProfile
      );

      expect(result.success).toBe(true);
      expect(result.brandId).toBe(brandId);

      // Verify user document was created/updated
      const userDoc = await firestore.collection("users").doc(userId).get();
      expect(userDoc.exists).toBe(true);
      const userData = userDoc.data();
      expect(userData.brand_id).toBe(brandId);
      expect(userData.name).toBe(userProfile.name);
      expect(userData.image).toBe(userProfile.image);
      expect(userData.auth_type).toBe(userProfile.auth_type);

      // Verify brand was updated with user
      const brandDoc = await firestore.collection("brands").doc(brandId).get();
      const brandData = brandDoc.data();
      expect(brandData.user_ids).toContain(userId);

      // Verify invite was marked as used
      const inviteDoc = await firestore
        .collection("brand_invites")
        .doc(token)
        .get();
      const inviteData = inviteDoc.data();
      expect(inviteData.used_by).toContain(userId);
      expect(inviteData.status).toBe("consumed");
    });

    it("should handle multi-use invites correctly", async () => {
      // Update invite to allow multiple uses
      await firestore.collection("brand_invites").doc(token).update({
        max_uses: 3,
      });

      // First user accepts
      const user1Id = "test-user-1";
      const user2Id = "test-user-2";
      const user3Id = "test-user-3";
      testDataIds.push(user1Id, user2Id, user3Id);

      await inviteService.acceptInvite(token, user1Id, {
        ...userProfile,
        name: "User 1",
      });

      // Verify invite is still active
      let inviteDoc = await firestore
        .collection("brand_invites")
        .doc(token)
        .get();
      let inviteData = inviteDoc.data();
      expect(inviteData.status).toBe("active");
      expect(inviteData.used_by).toHaveLength(1);

      // Second user accepts
      await inviteService.acceptInvite(token, user2Id, {
        ...userProfile,
        name: "User 2",
      });

      // Still active
      inviteDoc = await firestore.collection("brand_invites").doc(token).get();
      inviteData = inviteDoc.data();
      expect(inviteData.status).toBe("active");
      expect(inviteData.used_by).toHaveLength(2);

      // Third user accepts
      await inviteService.acceptInvite(token, user3Id, {
        ...userProfile,
        name: "User 3",
      });

      // Now should be consumed
      inviteDoc = await firestore.collection("brand_invites").doc(token).get();
      inviteData = inviteDoc.data();
      expect(inviteData.status).toBe("consumed");
      expect(inviteData.used_by).toHaveLength(3);

      // Verify all users are in brand
      const brandDoc = await firestore.collection("brands").doc(brandId).get();
      const brandData = brandDoc.data();
      expect(brandData.user_ids).toContain(user1Id);
      expect(brandData.user_ids).toContain(user2Id);
      expect(brandData.user_ids).toContain(user3Id);
    });

    it("should throw error if brand does not exist", async () => {
      // Delete the brand
      await firestore.collection("brands").doc(brandId).delete();

      await expect(
        inviteService.acceptInvite(token, userId, userProfile)
      ).rejects.toThrow(new InviteError("Brand not found", 404));
    });

    it("should throw error if user already linked to different brand", async () => {
      const otherBrandId = "other-test-brand-123";
      testDataIds.push(otherBrandId);

      // Create user already linked to different brand
      await firestore.collection("users").doc(userId).set({
        brand_id: otherBrandId,
        name: "Existing User",
      });

      await expect(
        inviteService.acceptInvite(token, userId, userProfile)
      ).rejects.toThrow(
        new InviteError("User already linked to another brand", 409)
      );
    });

    it("should allow user to accept invite for same brand they're already linked to", async () => {
      // Create user already linked to same brand
      await firestore.collection("users").doc(userId).set({
        brand_id: brandId,
        name: "Existing User",
      });

      // Should not throw error
      const result = await inviteService.acceptInvite(
        token,
        userId,
        userProfile
      );
      expect(result.success).toBe(true);
      expect(result.brandId).toBe(brandId);
    });

    it("should handle same user accepting invite multiple times idempotently", async () => {
      // First acceptance
      await inviteService.acceptInvite(token, userId, userProfile);

      // Reset invite for second attempt
      await firestore.collection("brand_invites").doc(token).update({
        status: "active",
        used_by: [],
        max_uses: 2,
      });

      // Second acceptance by same user should not duplicate
      await inviteService.acceptInvite(token, userId, userProfile);

      const inviteDoc = await firestore
        .collection("brand_invites")
        .doc(token)
        .get();
      const inviteData = inviteDoc.data();
      expect(inviteData.used_by).toEqual([userId]); // Only one instance

      const brandDoc = await firestore.collection("brands").doc(brandId).get();
      const brandData = brandDoc.data();
      expect(
        brandData.user_ids.filter((id: string) => id === userId)
      ).toHaveLength(1);
    });

    it("should handle multiple unique users accepting invites correctly", async () => {
      // Update invite to allow 2 users
      await firestore.collection("brand_invites").doc(token).update({
        max_uses: 2,
      });

      // Create 2 unique users for faster testing
      const uniqueUsers = [
        {
          id: "unique-user-001",
          profile: {
            ...userProfile,
            name: "Alice Johnson",
            auth_type: "google",
          },
        },
        {
          id: "unique-user-002",
          profile: { ...userProfile, name: "Bob Smith", auth_type: "github" },
        },
      ];

      testDataIds.push(...uniqueUsers.map((u) => u.id));

      // Each user accepts the invite
      for (let i = 0; i < uniqueUsers.length; i++) {
        const user = uniqueUsers[i];
        console.log(`User ${i + 1} (${user.id}) accepting invite...`);

        const result = await inviteService.acceptInvite(
          token,
          user.id,
          user.profile
        );
        expect(result.success).toBe(true);
        expect(result.brandId).toBe(brandId);

        // Verify invite state after each acceptance
        const inviteDoc = await firestore
          .collection("brand_invites")
          .doc(token)
          .get();
        const inviteData = inviteDoc.data();

        expect(inviteData.used_by).toHaveLength(i + 1);
        expect(inviteData.used_by).toContain(user.id);

        // Should still be active until max_uses reached
        if (i < uniqueUsers.length - 1) {
          expect(inviteData.status).toBe("active");
        } else {
          // Last user should consume the invite
          expect(inviteData.status).toBe("consumed");
        }

        // Verify user document was created with correct data
        const userDoc = await firestore.collection("users").doc(user.id).get();
        expect(userDoc.exists).toBe(true);
        const userData = userDoc.data();
        expect(userData.brand_id).toBe(brandId);
        expect(userData.name).toBe(user.profile.name);
        expect(userData.auth_type).toBe(user.profile.auth_type);
      }

      // Final verification: check brand has all unique users
      const finalBrandDoc = await firestore
        .collection("brands")
        .doc(brandId)
        .get();
      const finalBrandData = finalBrandDoc.data();

      // Should have all unique user IDs
      expect(finalBrandData.user_ids).toHaveLength(uniqueUsers.length);

      // Verify each user is in the brand's user_ids array exactly once
      uniqueUsers.forEach((user) => {
        expect(finalBrandData.user_ids).toContain(user.id);
        expect(
          finalBrandData.user_ids.filter((id: string) => id === user.id)
        ).toHaveLength(1); // Each user should appear exactly once
      });

      // Verify no duplicates in user_ids array
      const uniqueUserIds = [...new Set(finalBrandData.user_ids)];
      expect(uniqueUserIds).toHaveLength(finalBrandData.user_ids.length);

      // Fetch all user IDs back from the brand and verify they exist in users collection
      console.log(
        "🔍 Fetching user IDs from brand and verifying they exist..."
      );
      for (const fetchedUserId of finalBrandData.user_ids) {
        console.log(`Verifying user ${fetchedUserId} exists...`);

        const userDoc = await firestore
          .collection("users")
          .doc(fetchedUserId)
          .get();
        expect(userDoc.exists).toBe(true);

        const userData = userDoc.data();
        expect(userData.brand_id).toBe(brandId);

        // Find the corresponding user profile to verify data integrity
        const correspondingUser = uniqueUsers.find(
          (u) => u.id === fetchedUserId
        );
        expect(correspondingUser).toBeDefined();
        expect(userData.name).toBe(correspondingUser.profile.name);
        expect(userData.auth_type).toBe(correspondingUser.profile.auth_type);

        console.log(
          `✅ User ${fetchedUserId} verified: ${userData.name} (${userData.auth_type})`
        );
      }

      console.log(
        `✅ Successfully added and verified ${uniqueUsers.length} unique users to brand ${brandId}`
      );
      console.log("Final brand user_ids:", finalBrandData.user_ids);
      console.log("All users exist in database and have correct brand_id");
    }, 15000); // 15 second timeout

    it("should prevent duplicate user IDs when same user tries to accept multiple times", async () => {
      // Update invite to allow multiple uses
      await firestore.collection("brand_invites").doc(token).update({
        max_uses: 10,
      });

      const duplicateUserId = "duplicate-test-user";
      const duplicateProfile = { ...userProfile, name: "Duplicate User" };
      testDataIds.push(duplicateUserId);

      // First acceptance
      await inviteService.acceptInvite(
        token,
        duplicateUserId,
        duplicateProfile
      );

      // Verify initial state
      let brandDoc = await firestore.collection("brands").doc(brandId).get();
      let brandData = brandDoc.data();
      expect(brandData.user_ids).toContain(duplicateUserId);
      expect(
        brandData.user_ids.filter((id: string) => id === duplicateUserId)
      ).toHaveLength(1);

      // Try to accept again with same user ID (simulating double-click or retry)
      await inviteService.acceptInvite(
        token,
        duplicateUserId,
        duplicateProfile
      );

      // Verify no duplicate was added
      brandDoc = await firestore.collection("brands").doc(brandId).get();
      brandData = brandDoc.data();
      expect(
        brandData.user_ids.filter((id: string) => id === duplicateUserId)
      ).toHaveLength(1);

      // Accept with a few more different users to make sure array operations work correctly
      const otherUsers = ["other-user-1", "other-user-2"];
      testDataIds.push(...otherUsers);

      for (const otherUserId of otherUsers) {
        await inviteService.acceptInvite(token, otherUserId, {
          ...userProfile,
          name: `User ${otherUserId}`,
        });
      }

      // Try duplicate user again
      await inviteService.acceptInvite(
        token,
        duplicateUserId,
        duplicateProfile
      );

      // Final verification
      brandDoc = await firestore.collection("brands").doc(brandId).get();
      brandData = brandDoc.data();

      // Should have exactly 3 unique users
      expect(brandData.user_ids).toHaveLength(3);
      expect(brandData.user_ids).toContain(duplicateUserId);
      expect(brandData.user_ids).toContain("other-user-1");
      expect(brandData.user_ids).toContain("other-user-2");

      // No duplicates
      expect(
        brandData.user_ids.filter((id: string) => id === duplicateUserId)
      ).toHaveLength(1);

      console.log(
        "✅ Successfully prevented duplicate user IDs in brand user_ids array"
      );
      console.log("Final user_ids:", brandData.user_ids);
    }, 10000); // 10 second timeout
  });

  describe("getInviteMetadata", () => {
    it("should return complete invite metadata", async () => {
      const brandId = "meta-test-brand-123";
      const token = "meta-test-token-123";
      const brandName = "Meta Test Brand";
      testDataIds.push(brandId, token);

      // Create brand
      await firestore.collection("brands").doc(brandId).set({
        name: brandName,
        user_ids: [],
      });

      // Create invite
      const expiresAt = Timestamp.fromDate(
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      );
      await firestore
        .collection("brand_invites")
        .doc(token)
        .set({
          brand_id: brandId,
          status: "active",
          expires_at: expiresAt,
          used_by: ["user1"],
          max_uses: 3,
        });

      const metadata = await inviteService.getInviteMetadata(token);

      expect(metadata.token).toBe(token);
      expect(metadata.brandId).toBe(brandId);
      expect(metadata.brandName).toBe(brandName);
      expect(metadata.status).toBe("active");
      expect(metadata.expiresAt).toBe(expiresAt.toDate().toISOString());
      expect(metadata.maxUses).toBe(3);
      expect(metadata.usedCount).toBe(1);
    });

    it("should handle missing brand gracefully", async () => {
      const token = "orphan-test-token-123";
      testDataIds.push(token);

      await firestore.collection("brand_invites").doc(token).set({
        brand_id: "non-existent-brand",
        status: "active",
        used_by: [],
        max_uses: 1,
      });

      const metadata = await inviteService.getInviteMetadata(token);
      expect(metadata.brandName).toBeNull();
    });

    it("should throw error for non-existent invite", async () => {
      await expect(
        inviteService.getInviteMetadata("non-existent")
      ).rejects.toThrow(new InviteError("Invite not found", 404));
    });
  });
});
