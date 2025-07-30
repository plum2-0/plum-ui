import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

// Shared auth configuration used by both main auth and edge auth
export default {
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
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
          provider: account.provider,
        }
      }

      // Return previous token if the user is already signed in
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // If there's a specific callback URL with parameters (like OAuth callbacks), preserve it
      const urlObj = new URL(url);
      const searchParams = urlObj.searchParams;
      
      // Preserve OAuth callback redirects with parameters
      if (searchParams.has('reddit') || searchParams.has('error') || searchParams.has('callbackUrl')) {
        return url.startsWith(baseUrl) ? url : baseUrl;
      }
      
      // Only redirect to onboarding for initial sign-in (when URL is just the baseUrl)
      if (url === baseUrl) {
        return `${baseUrl}/onboarding`;
      }
      
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig