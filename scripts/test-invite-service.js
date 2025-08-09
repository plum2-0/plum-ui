#!/usr/bin/env node

/**
 * Script to run the InviteService integration tests against the live Firebase database
 *
 * Prerequisites:
 * 1. Firebase Admin credentials configured (via environment variables or service account key)
 * 2. Run this script: `node scripts/test-invite-service.js`
 *
 * ⚠️  WARNING: This runs against your LIVE Firebase database!
 * The tests will create and clean up test data, but use with caution.
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

console.log(
  "🚀 Running InviteService Integration Tests Against Live Database\n"
);

// Safety warning
console.log(
  "⚠️  WARNING: This will run tests against your LIVE Firebase database!"
);
console.log("   Test data will be created and cleaned up automatically.");
console.log(
  "   Make sure your Firebase Admin credentials are properly configured.\n"
);

// Check for required environment variables
const requiredEnvVars = [
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingVars.forEach((varName) => console.error(`   - ${varName}`));
  console.error(
    "\n   Please set these environment variables before running tests."
  );
  process.exit(1);
}

// Run the specific test file
const testFile =
  "src/__tests__/integration/services/invite-service.integration.test.ts";

const jest = spawn(
  "npx",
  ["jest", testFile, "--verbose", "--detectOpenHandles"],
  {
    stdio: "inherit",
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: "test",
    },
  }
);

jest.on("close", (code) => {
  if (code === 0) {
    console.log("\n✅ All tests passed!");
    console.log("🔍 Test data has been left in the database for inspection.");
    console.log("💡 Check your Firebase console to see the test data created.");
  } else {
    console.log(`\n❌ Tests failed with exit code ${code}`);
    console.log(
      "🧹 You may want to manually check for any leftover test data."
    );
  }
  process.exit(code);
});

jest.on("error", (err) => {
  console.error("❌ Failed to start test runner:", err);
  process.exit(1);
});
