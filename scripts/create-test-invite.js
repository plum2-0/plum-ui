#!/usr/bin/env node

/**
 * Simple script to create test invite data for API testing
 */

const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

async function createTestData() {
  console.log("🔧 Creating test invite data for API testing...\n");

  const brandId = "api-test-brand-123";
  const token = "api-test-token-123";

  const script = `
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

async function createData() {
  const firestore = adminDb();

  // Create a test brand
  await firestore.collection("brands").doc("${brandId}").set({
    name: "API Test Brand",
    user_ids: [],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  });

  // Create a test invite
  await firestore.collection("brand_invites").doc("${token}").set({
    brand_id: "${brandId}",
    status: "active",
    expires_at: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    used_by: [],
    max_uses: 5,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  });

  console.log("✅ Test data created:");
  console.log("   Brand ID: ${brandId}");
  console.log("   Token: ${token}");
  console.log("\\n🌐 Test the API with:");
  console.log("   GET  http://localhost:3000/api/invites/${token}");
  console.log("   POST http://localhost:3000/api/invites/${token}");
}

createData().catch(console.error);
  `;

  // Write temporary script
  const fs = require("fs");
  const path = require("path");
  const tempScript = path.join(__dirname, "temp-create-data.mjs");

  fs.writeFileSync(tempScript, script);

  try {
    // Run the script using Next.js
    const { stdout, stderr } = await execAsync(`npx tsx ${tempScript}`, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: "development",
      },
    });

    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error("Error creating test data:", error);
  } finally {
    // Clean up temp file
    try {
      fs.unlinkSync(tempScript);
    } catch {}
  }
}

createTestData();
