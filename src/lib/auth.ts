import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { cert } from "firebase-admin/app"
import type { Adapter } from "next-auth/adapters"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  adapter: FirestoreAdapter({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    })
  }) as Adapter,
  session: {
    strategy: "database"
  },
  callbacks: {
    async session({ session, user }) {
      // With database sessions, we get the user object directly
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to onboarding after sign in
      if (url === baseUrl) {
        return `${baseUrl}/onboarding`
      }
      return url.startsWith(baseUrl) ? url : baseUrl
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
})