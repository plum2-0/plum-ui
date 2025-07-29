import NextAuth from "next-auth"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import type { Adapter } from "next-auth/adapters"
import authConfig from "./auth.config"

// Initialize Firebase Admin with the plummy database
const app = getApps().length === 0 ? initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  })
}) : getApps()[0]

// Get Firestore instance with the 'plummy' database
const firestore = getFirestore(app, 'plummy')

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: FirestoreAdapter(firestore) as Adapter,
  // Even with database adapter, we use JWT strategy to maintain compatibility with edge runtime
  session: {
    strategy: "jwt"
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account, trigger }) {
      // When user signs in, save user data from database to token
      if (account && user) {
        return {
          ...token,
          id: user.id,
          provider: account.provider,
        }
      }
      
      // For subsequent requests, the token already has the user data
      return token
    },
  }
})