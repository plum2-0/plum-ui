#!/usr/bin/env node

/**
 * Debug script to test the invite API route directly
 * This will help identify what's different between the test and the API route
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Load environment variables from .env.local
function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const lines = envContent.split("\n");

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, ...valueParts] = trimmedLine.split("=");
        if (key && valueParts.length > 0) {
          let value = valueParts.join("=");
          // Remove quotes if present
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }
          process.env[key] = value;
        }
      }
    });
    console.log("✅ Loaded environment variables from .env.local");
  } else {
    console.log("⚠️  No .env.local file found");
  }
}

loadEnvLocal();

// Import modules after env is loaded
const { adminDb } = require("../src/lib/firebase-admin");
const { InviteService } = require("../src/services/invite-service");
const { Timestamp } = require("firebase-admin/firestore");

async function createTestInvite() {
  console.log("🔧 Creating test invite for API testing...\n");

  const firestore = adminDb();
  const brandId = "debug-brand-api-test";
  const token = "debug-invite-token-api";

  // Create a test brand
  await firestore.collection("brands").doc(brandId).set({
    name: "Debug API Test Brand",
    user_ids: [],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  });

  // Create a test invite
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
      max_uses: 5,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });

  console.log("✅ Created test data:");
  console.log(`   Brand ID: ${brandId}`);
  console.log(`   Token: ${token}`);
  console.log(`\n🌐 Test the API with:`);
  console.log(`   GET  http://localhost:3000/api/invites/${token}`);
  console.log(`   POST http://localhost:3000/api/invites/${token}`);
  console.log(`\n🔍 Monitor the database while testing the API\n`);

  return { brandId, token };
}

async function testDirectInviteService() {
  console.log("🧪 Testing InviteService directly (like in tests)...\n");

  const firestore = adminDb();
  const inviteService = new InviteService(firestore);

  const brandId = "debug-brand-direct-test";
  const token = "debug-invite-token-direct";
  const userId = "debug-user-direct";

  // Create test data
  await firestore.collection("brands").doc(brandId).set({
    name: "Debug Direct Test Brand",
    user_ids: [],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  });

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
      max_uses: 5,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });

  const userProfile = {
    name: "Debug Test User",
    image: "https://example.com/avatar.jpg",
    auth_type: "debug",
  };

  // Test direct service call
  try {
    const result = await inviteService.acceptInvite(token, userId, userProfile);
    console.log("✅ Direct InviteService call succeeded:");
    console.log("   Result:", result);

    // Verify the data was written
    const userDoc = await firestore.collection("users").doc(userId).get();
    const brandDoc = await firestore.collection("brands").doc(brandId).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log("✅ User document created:");
      console.log("   User brand_id:", userData.brand_id);
      console.log("   User name:", userData.name);
    } else {
      console.log("❌ User document NOT found");
    }

    if (brandDoc.exists) {
      const brandData = brandDoc.data();
      console.log("✅ Brand document updated:");
      console.log("   Brand user_ids:", brandData.user_ids);
    } else {
      console.log("❌ Brand document NOT found");
    }
  } catch (error) {
    console.error("❌ Direct InviteService call failed:", error);
  }
}

async function main() {
  console.log("🚀 Debug API Invite Service\n");

  try {
    // Test 1: Direct InviteService call
    await testDirectInviteService();
    console.log("\n" + "=".repeat(60) + "\n");

    // Test 2: Create test data for API testing
    await createTestInvite();
  } catch (error) {
    console.error("❌ Debug script failed:", error);
  }
}

main();
