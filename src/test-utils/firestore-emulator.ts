import { initializeApp, cert, getApps, deleteApp, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let testApp: App;
let testFirestore: Firestore;

export const TEST_PROJECT_ID = "test-project";

export function initializeTestFirestore(): Firestore {
  // Clear any existing apps
  const apps = getApps();
  apps.forEach(app => {
    if (app.name === "test-app") {
      deleteApp(app);
    }
  });

  // Initialize test app with emulator settings
  testApp = initializeApp({
    projectId: TEST_PROJECT_ID,
    credential: cert({
      projectId: TEST_PROJECT_ID,
      clientEmail: "test@test.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9W8bAFa0d5Aye\nHzj8vXpiHmHZ3ggSkQ==\n-----END PRIVATE KEY-----\n"
    })
  }, "test-app");

  // Set environment variable to use emulator
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";

  testFirestore = getFirestore(testApp, "plummydb");
  
  // Disable SSL for emulator
  testFirestore.settings({
    ignoreUndefinedProperties: true,
  });

  return testFirestore;
}

export async function clearFirestore() {
  if (!testFirestore) return;
  
  const collections = ["projects", "users"];
  
  for (const collection of collections) {
    const snapshot = await testFirestore.collection(collection).get();
    const batch = testFirestore.batch();
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }
}

export async function cleanupTestFirestore() {
  if (testApp) {
    await deleteApp(testApp);
  }
  delete process.env.FIRESTORE_EMULATOR_HOST;
}

export function getTestFirestore(): Firestore {
  if (!testFirestore) {
    throw new Error("Test Firestore not initialized. Call initializeTestFirestore() first.");
  }
  return testFirestore;
}