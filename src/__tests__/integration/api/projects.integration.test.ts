/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { POST } from "@/app/api/projects/route";
import { 
  initializeTestFirestore, 
  clearFirestore, 
  cleanupTestFirestore,
  getTestFirestore 
} from "@/test-utils/firestore-emulator";
import { auth } from "@/lib/auth";

// Mock the auth module
jest.mock("@/lib/auth", () => ({
  auth: jest.fn()
}));

// Create a variable to hold the getTestFirestore function
let getTestFirestoreRef: typeof getTestFirestore;

// Mock the firebase-admin module to use our test instance
jest.mock("@/lib/firebase-admin", () => ({
  adminDb: jest.fn(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getTestFirestore } = require("@/test-utils/firestore-emulator");
    return getTestFirestore();
  })
}));

describe("Projects API Integration Tests", () => {
  beforeAll(async () => {
    // Initialize the test Firestore instance
    initializeTestFirestore();
  });

  beforeEach(async () => {
    // Clear all data before each test
    await clearFirestore();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Cleanup
    await cleanupTestFirestore();
  });

  describe("POST /api/projects", () => {
    it("should create a new project and user document", async () => {
      const userId = "test-user-123";
      const projectName = "Test Project";
      const description = "Test project description";

      // Mock authenticated user
      (auth as jest.Mock).mockResolvedValue({ 
        user: { id: userId } 
      });

      const request = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        body: JSON.stringify({ 
          project_name: projectName, 
          description: description 
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Verify response
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.project_id).toBeDefined();
      expect(data.message).toBe("Project created successfully and user updated");

      // Verify data in Firestore
      const firestore = getTestFirestore();
      
      // Check project document
      const projectDoc = await firestore
        .collection("projects")
        .doc(data.project_id)
        .get();
      
      expect(projectDoc.exists).toBe(true);
      const projectData = projectDoc.data();
      expect(projectData?.project_name).toBe(projectName);
      expect(projectData?.description).toBe(description);
      expect(projectData?.status).toBe("active");
      expect(projectData?.users).toHaveLength(1);
      expect(projectData?.users[0].user_id).toBe(userId);

      // Check user document
      const userDoc = await firestore
        .collection("users")
        .doc(userId)
        .get();
      
      expect(userDoc.exists).toBe(true);
      const userData = userDoc.data();
      expect(userData?.projects).toContain(data.project_id);
      expect(userData?.user_id).toBe(userId);
    });

    it("should add project to existing user's projects array", async () => {
      const userId = "existing-user-123";
      const existingProjectId = "existing-project-id";
      
      // Create existing user with a project
      const firestore = getTestFirestore();
      await firestore.collection("users").doc(userId).set({
        user_id: userId,
        projects: [existingProjectId],
        created_at: new Date(),
        updated_at: new Date()
      });

      // Mock authenticated user
      (auth as jest.Mock).mockResolvedValue({ 
        user: { id: userId } 
      });

      const request = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        body: JSON.stringify({ 
          project_name: "New Project" 
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);

      // Verify user document was updated
      const userDoc = await firestore
        .collection("users")
        .doc(userId)
        .get();
      
      const userData = userDoc.data();
      expect(userData?.projects).toHaveLength(2);
      expect(userData?.projects).toContain(existingProjectId);
      expect(userData?.projects).toContain(data.project_id);
    });

    it("should handle concurrent project creation", async () => {
      const userId = "concurrent-user-123";
      
      // Mock authenticated user
      (auth as jest.Mock).mockResolvedValue({ 
        user: { id: userId } 
      });

      // Create multiple projects concurrently
      const promises = Array.from({ length: 3 }, (_, i) => {
        const request = new NextRequest("http://localhost:3000/api/projects", {
          method: "POST",
          body: JSON.stringify({ 
            project_name: `Project ${i + 1}` 
          }),
        });
        return POST(request);
      });

      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map(r => r.json()));

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Check user document has all projects
      const firestore = getTestFirestore();
      const userDoc = await firestore
        .collection("users")
        .doc(userId)
        .get();
      
      const userData = userDoc.data();
      expect(userData?.projects).toHaveLength(3);
      
      // Verify all project IDs are unique
      const projectIds = results.map(r => r.project_id);
      const uniqueIds = new Set(projectIds);
      expect(uniqueIds.size).toBe(3);
    });

    it("should trim whitespace from project name and description", async () => {
      const userId = "trim-test-user";
      
      (auth as jest.Mock).mockResolvedValue({ 
        user: { id: userId } 
      });

      const request = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        body: JSON.stringify({ 
          project_name: "  Trimmed Project  ",
          description: "  Trimmed Description  "
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);

      // Verify trimmed data in Firestore
      const firestore = getTestFirestore();
      const projectDoc = await firestore
        .collection("projects")
        .doc(data.project_id)
        .get();
      
      const projectData = projectDoc.data();
      expect(projectData?.project_name).toBe("Trimmed Project");
      expect(projectData?.description).toBe("Trimmed Description");
    });

    it("should handle empty description correctly", async () => {
      const userId = "no-desc-user";
      
      (auth as jest.Mock).mockResolvedValue({ 
        user: { id: userId } 
      });

      const request = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        body: JSON.stringify({ 
          project_name: "No Description Project"
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);

      // Verify in Firestore
      const firestore = getTestFirestore();
      const projectDoc = await firestore
        .collection("projects")
        .doc(data.project_id)
        .get();
      
      const projectData = projectDoc.data();
      expect(projectData?.description).toBe("");
    });

    it("should return 401 for unauthenticated requests", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        body: JSON.stringify({ 
          project_name: "Unauthorized Project" 
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");

      // Verify no project was created
      const firestore = getTestFirestore();
      const projectsSnapshot = await firestore.collection("projects").get();
      expect(projectsSnapshot.empty).toBe(true);
    });

    it("should return 400 for missing project name", async () => {
      (auth as jest.Mock).mockResolvedValue({ 
        user: { id: "test-user" } 
      });

      const request = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        body: JSON.stringify({ 
          description: "No name provided" 
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("project_name is required");
    });

    it("should return 400 for invalid JSON", async () => {
      (auth as jest.Mock).mockResolvedValue({ 
        user: { id: "test-user" } 
      });

      const request = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        body: "invalid json",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid JSON body");
    });
  });
});