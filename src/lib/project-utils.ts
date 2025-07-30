import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin";

interface RedditSource {
  oauth_token?: string;
  oauth_token_expires_at?: number;
  refresh_token?: string;
  subreddits?: string[];
  keywords?: string[];
  username?: string; // Adding username for display
}

interface Project {
  project_id?: string;
  project_name?: string;
  user_ids: string[]; // Changed to match actual data structure
  source?: {
    reddit?: RedditSource;
  };
  destination?: {
    discord?: {
      server_id: string;
      channel_id: string;
      bot_token: string;
    };
  };
  created_at: Timestamp;
  updated_at: Timestamp;
  status: string;
}

/**
 * Find or create a project for the user
 */
export async function findOrCreateProject(
  userId: string,
  projectName?: string
): Promise<string> {
  try {
    // Get the firestore instance and validate it
    const firestore = adminDb();

    if (!firestore) {
      throw new Error(
        "Firestore instance is not available. Check Firebase Admin configuration."
      );
    }

    const projectsRef = firestore.collection("projects");

    // Validate that we have the necessary environment variables
    if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
      throw new Error(
        "FIREBASE_ADMIN_PROJECT_ID environment variable is required"
      );
    }

    // First, try to find an existing project for this user with new structure
    let querySnapshot = await projectsRef
      .where("user_ids", "array-contains", userId)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      // Return existing project ID
      return querySnapshot.docs[0].id;
    }

    // Try to find with old structure (for backward compatibility)
    const allProjects = await projectsRef.get();
    for (const doc of allProjects.docs) {
      const data = doc.data();
      // Check if this is an old structure project with users array
      if (data.users && Array.isArray(data.users)) {
        const hasUser = data.users.some((u: any) => 
          (typeof u === 'string' && u === userId) || 
          (u && typeof u === 'object' && u.user_id === userId)
        );
        if (hasUser) {
          // Migrate to new structure
          await doc.ref.update({
            user_ids: data.users.map((u: any) => 
              typeof u === 'string' ? u : u.user_id
            ),
            updated_at: Timestamp.now()
          });
          return doc.id;
        }
      }
    }

    // Create a new project (this will create the collection if it doesn't exist)
    const newProject = {
      project_name: projectName || "My Project",
      user_ids: [userId],
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
      status: "active",
    };

    const docRef = await projectsRef.add(newProject);
    return docRef.id;
  } catch (error) {
    console.error("Error in findOrCreateProject:", error);
    throw new Error(
      `Failed to find or create project: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Update project with Reddit credentials
 */
export async function updateProjectRedditCredentials(
  projectId: string,
  redditData: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    username: string;
  }
): Promise<void> {
  const firestore = adminDb();

  if (!firestore) {
    throw new Error(
      "Firestore instance is not available. Check Firebase Admin configuration."
    );
  }

  const projectRef = firestore.collection("projects").doc(projectId);

  await projectRef.update({
    "source.reddit": {
      oauth_token: redditData.accessToken,
      oauth_token_expires_at: redditData.expiresAt,
      refresh_token: redditData.refreshToken,
      username: redditData.username,
      subreddits: [],
      keywords: [],
    },
    updated_at: Timestamp.now(),
  });
}

/**
 * Get project by ID
 */
export async function getProject(projectId: string): Promise<Project | null> {
  const firestore = adminDb();

  if (!firestore) {
    throw new Error(
      "Firestore instance is not available. Check Firebase Admin configuration."
    );
  }

  const projectRef = firestore.collection("projects").doc(projectId);
  const doc = await projectRef.get();

  if (!doc.exists) {
    return null;
  }

  return { project_id: doc.id, ...doc.data() } as Project;
}

/**
 * Check if user belongs to project
 */
export async function userBelongsToProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  const project = await getProject(projectId);
  if (!project) return false;

  return project.user_ids.includes(userId);
}
