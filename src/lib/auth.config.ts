import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

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
          response_type: "code",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  cookies: {
    pkceCodeVerifier: {
      name: `${
        process.env.NODE_ENV === "production" ? "__Secure-" : ""
      }next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15, // 15 minutes
        ...(process.env.NODE_ENV === "production" && process.env.NEXTAUTH_URL
          ? {
              domain: new URL(process.env.NEXTAUTH_URL).hostname.startsWith(
                "www."
              )
                ? new URL(process.env.NEXTAUTH_URL).hostname.substring(4)
                : new URL(process.env.NEXTAUTH_URL).hostname,
            }
          : {}),
      },
    },
    // Also configure the state cookie for consistency
    state: {
      name: `${
        process.env.NODE_ENV === "production" ? "__Secure-" : ""
      }next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15, // 15 minutes
        ...(process.env.NODE_ENV === "production" && process.env.NEXTAUTH_URL
          ? {
              domain: new URL(process.env.NEXTAUTH_URL).hostname.startsWith(
                "www."
              )
                ? new URL(process.env.NEXTAUTH_URL).hostname.substring(4)
                : new URL(process.env.NEXTAUTH_URL).hostname,
            }
          : {}),
      },
    },
  },
  callbacks: {
    async signIn({ account }) {
      // Add error handling for OAuth sign-in
      try {
        if (account?.provider === "google") {
          return true;
        }
        return true;
      } catch (error) {
        console.error("Sign-in error:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
          provider: account.provider,
        };
      }

      // Return previous token if the user is already signed in
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Ensure we have valid URL parameters
      if (!url || !baseUrl) {
        return baseUrl || "/";
      }

      // If URL is relative or invalid, handle it safely
      let urlObj;
      try {
        // Try to create URL object, handle both absolute and relative URLs
        urlObj = url.startsWith("http") ? new URL(url) : new URL(url, baseUrl);
      } catch {
        // If URL parsing fails, fall back to baseUrl
        console.warn("Invalid URL in redirect callback:", url);
        return baseUrl;
      }

      const searchParams = urlObj.searchParams;

      // Preserve OAuth callback redirects with parameters
      if (
        searchParams.has("reddit") ||
        searchParams.has("error") ||
        searchParams.has("callbackUrl")
      ) {
        return url.startsWith(baseUrl) ? url : baseUrl;
      }

      // Check if the URL is for an invite page - preserve these
      if (urlObj.pathname.startsWith("/invite/")) {
        return url.startsWith(baseUrl) ? url : baseUrl;
      }

      // Only redirect to onboarding for initial sign-in (when URL is just the baseUrl)
      if (url === baseUrl) {
        return `${baseUrl}/onboarding`;
      }

      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
} satisfies NextAuthConfig;
