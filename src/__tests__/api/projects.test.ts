/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { POST } from "@/app/api/projects/route";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

// Mock dependencies
jest.mock("@/lib/auth");
jest.mock("@/lib/firebase-admin");

// Mock Timestamp
jest.mock("firebase-admin/firestore", () => ({
  Timestamp: {
    now: jest.fn(() => ({
      toDate: () => new Date(),
      seconds: Date.now() / 1000,
      nanoseconds: 0,
    })),
  },
}));

// Mock Firestore transaction functions
const mockSet = jest.fn();
const mockGet = jest.fn();
const mockUpdate = jest.fn();
const mockDoc = jest.fn();
const mockCollection = jest.fn();
const mockRunTransaction = jest.fn();

describe("POST /api/projects", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (adminDb as jest.Mock).mockReturnValue({
      collection: mockCollection,
      runTransaction: mockRunTransaction,
    });

    mockCollection.mockReturnValue({
      doc: mockDoc,
    });

    mockDoc.mockReturnValue({
      id: "test-project-id",
    });
  });

  it("should return 401 if user is not authenticated", async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      body: JSON.stringify({ project_name: "Test Project" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 if request body is invalid JSON", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-123" } });

    const request = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      body: "invalid json",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid JSON body");
  });

  it("should return 400 if project_name is missing", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-123" } });

    const request = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      body: JSON.stringify({ description: "No name provided" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("project_name is required");
  });

  it("should return 400 if project_name is empty or whitespace", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-123" } });

    const request = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      body: JSON.stringify({ project_name: "   " }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("project_name is required");
  });

  it("should return 500 if database is not available", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-123" } });
    (adminDb as jest.Mock).mockReturnValue(null);

    const request = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      body: JSON.stringify({ project_name: "Test Project" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Database not available");
  });

  it("should create project and update existing user successfully", async () => {
    const userId = "user-123";
    const projectName = "Test Project";
    const description = "Test Description";

    (auth as jest.Mock).mockResolvedValue({ user: { id: userId } });

    // Mock existing user with projects
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        projects: ["existing-project-id"],
      }),
    });

    mockRunTransaction.mockImplementation(async (callback) => {
      const transaction = {
        set: mockSet,
        get: mockGet,
        update: mockUpdate,
      };
      return await callback(transaction);
    });

    const request = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      body: JSON.stringify({ project_name: projectName, description }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.project_id).toBe("test-project-id");
    expect(data.message).toBe("Project created successfully and user updated");

    // Verify project was created
    expect(mockSet).toHaveBeenCalledWith(
      { id: "test-project-id" },
      expect.objectContaining({
        project_name: projectName,
        description: description,
        status: "active",
        users: expect.arrayContaining([
          expect.objectContaining({
            user_id: userId,
          }),
        ]),
      })
    );

    // Verify user was updated
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        projects: ["existing-project-id", "test-project-id"],
      })
    );
  });

  it("should create project and create new user if user doesn't exist", async () => {
    const userId = "new-user-123";
    const projectName = "Test Project";

    (auth as jest.Mock).mockResolvedValue({ user: { id: userId } });

    // Mock non-existing user
    mockGet.mockResolvedValue({
      exists: false,
    });

    mockRunTransaction.mockImplementation(async (callback) => {
      const transaction = {
        set: mockSet,
        get: mockGet,
        update: mockUpdate,
      };
      return await callback(transaction);
    });

    const request = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      body: JSON.stringify({ project_name: projectName }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);

    // Verify user was created (second call to set)
    expect(mockSet).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      expect.objectContaining({
        user_id: userId,
        projects: ["test-project-id"],
      })
    );
  });

  it("should handle transaction errors gracefully", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-123" } });

    mockRunTransaction.mockRejectedValue(new Error("Transaction failed"));

    const request = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      body: JSON.stringify({ project_name: "Test Project" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to create project");
    expect(data.details).toBe("Transaction failed");
  });

  it("should trim project name and description", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-123" } });

    mockGet.mockResolvedValue({ exists: false });
    mockRunTransaction.mockImplementation(async (callback) => {
      const transaction = {
        set: mockSet,
        get: mockGet,
        update: mockUpdate,
      };
      return await callback(transaction);
    });

    const request = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      body: JSON.stringify({
        project_name: "  Test Project  ",
        description: "  Test Description  ",
      }),
    });

    const response = await POST(request);
    await response.json();

    expect(mockSet).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        project_name: "Test Project",
        description: "Test Description",
      })
    );
  });

  it("should not add duplicate project_id to user's projects array", async () => {
    const userId = "user-123";
    const projectId = "test-project-id";

    (auth as jest.Mock).mockResolvedValue({ user: { id: userId } });

    // Mock user already has this project ID
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        projects: [projectId, "other-project"],
      }),
    });

    mockRunTransaction.mockImplementation(async (callback) => {
      const transaction = {
        set: mockSet,
        get: mockGet,
        update: mockUpdate,
      };
      return await callback(transaction);
    });

    const request = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      body: JSON.stringify({ project_name: "Test Project" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});