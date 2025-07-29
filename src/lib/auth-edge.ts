import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

// Edge-compatible auth configuration without firebase-admin
export const authEdge = NextAuth({
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
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          provider: account.provider,
          userId: user.id,
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string
        session.user.provider = token.provider as string
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

export const { auth } = authEdge