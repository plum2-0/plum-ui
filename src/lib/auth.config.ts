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
      profile(profile: any) {
        // Normalize email to lowercase to avoid linking issues
        return {
          id: profile.sub,
          name: profile.name,
          email: (profile.email || "").toLowerCase(),
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null,
        } as any;
      },
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  events: {
    async linkAccount({ user, account }) {
      console.log(
        "[NextAuth] Linked account",
        account?.provider,
        "→ user:",
        user?.id
      );
    },
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
    async signIn({ account, profile, user }) {
      // Add error handling for OAuth sign-in
      try {
        if (account?.provider === "google") {
          // Only allow linking if Google says the email is verified
          const emailVerified = (profile as any)?.email_verified;
          console.log("[NextAuth] Google sign-in attempt:", {
            email: (profile as any)?.email,
            emailVerified,
            userId: user?.id,
            accountId: account?.id,
          });
          return emailVerified === true;
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
      let urlObj: URL;
      try {
        // Try to create URL object, handle both absolute and relative URLs
        urlObj = url.startsWith("http") ? new URL(url) : new URL(url, baseUrl);
      } catch {
        // If URL parsing fails, fall back to baseUrl
        console.warn("Invalid URL in redirect callback:", url);
        return baseUrl;
      }

      const searchParams = urlObj.searchParams;

      // If a callbackUrl param is present, redirect to that value instead of the current URL
      if (searchParams.has("callbackUrl")) {
        const target = searchParams.get("callbackUrl") || "/";
        try {
          const targetUrl = target.startsWith("http")
            ? new URL(target)
            : new URL(target, baseUrl);
          // Only allow same-origin redirects
          return targetUrl.origin === new URL(baseUrl).origin
            ? targetUrl.toString()
            : baseUrl;
        } catch {
          return baseUrl;
        }
      }

      // Preserve OAuth flows or error displays with parameters on the URL
      if (searchParams.has("reddit") || searchParams.has("error")) {
        return url.startsWith(baseUrl) ? url : baseUrl;
      }

      // Check if the URL is for an invite page - preserve these
      if (urlObj.pathname.startsWith("/invite/")) {
        return url.startsWith(baseUrl) ? url : baseUrl;
      }

      // Default: keep URL if same-origin, otherwise fall back to baseUrl
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
