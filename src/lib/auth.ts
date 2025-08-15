import NextAuth from "next-auth";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Adapter } from "next-auth/adapters";
import authConfig from "./auth.config";

// Initialize Firebase Admin with the plummy database
const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(
            /\\n/g,
            "\n"
          ),
        }),
      })
    : getApps()[0];

// Get Firestore instance with the 'plummy' database
const firestore = getFirestore(app, "plummydb");

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: FirestoreAdapter(firestore) as Adapter,
  // Even with database adapter, we use JWT strategy to maintain compatibility with edge runtime
  session: {
    strategy: "jwt",
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      // When user signs in, save user data from database to token
      if (account && user) {
        // Load brandId from Firestore on sign-in
        try {
          const userRef = firestore.collection("users").doc(user.id!);
          const userDoc = await userRef.get();
          const userData = userDoc.data();

          return {
            ...token,
            id: user.id,
            provider: account.provider,
            brandId: userData?.brand_id || null,
          };
        } catch (error) {
          console.error("Failed to load user data in JWT callback:", error);
          return {
            ...token,
            id: user.id,
            provider: account.provider,
            brandId: null,
          };
        }
      }

      // For subsequent requests, lazily hydrate brandId if missing
      if (token) {
        try {
          const userId = (token as any).id || (token as any).sub;
          if (userId) {
            const userRef = firestore.collection("users").doc(String(userId));
            const userDoc = await userRef.get();
            const userData = userDoc.data();
            return {
              ...token,
              brandId: userData?.brand_id || null,
            };
          }
        } catch (error) {
          console.error(
            "Failed to lazily hydrate brandId in JWT callback:",
            error
          );
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string;
        session.user.provider = token.provider as string;
        session.user.brandId = token.brandId as string | null;
      }
      return session;
    },
  },
});
