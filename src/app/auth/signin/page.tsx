"use client";

import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { PlumSproutLogo } from "@/components/PlumSproutLogo";
import { usePublicPageRedirects } from "@/hooks/useRedirects";

function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // // Use public page auth - redirects authenticated users appropriately
  // const { isLoading } = usePublicPageRedirects();

  // // Handle invite callback URLs specially, otherwise redirect to onboarding

  const incomingCallbackUrl = searchParams.get("callbackUrl");
  // Accept only same-origin relative invite callback to avoid redirecting elsewhere
  const callbackUrl =
    incomingCallbackUrl && incomingCallbackUrl.startsWith("/invite/")
      ? incomingCallbackUrl
      : "/onboarding";

  // // Show loading while checking auth
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
  //       <div
  //         className="absolute inset-0 z-0"
  //         style={{
  //           background: `
  //             radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
  //             radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
  //             radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.2), transparent 50%),
  //             linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
  //           `,
  //         }}
  //       />
  //       <div className="text-white text-xl relative z-10">Loading...</div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background with Liquid Glass Effect */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.2), transparent 50%),
            linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
          `,
        }}
      />

      {/* Floating Glass Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-30 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.1) 70%, transparent 100%)",
            filter: "blur(40px)",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-40 right-32 w-96 h-96 rounded-full opacity-25 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.1) 70%, transparent 100%)",
            filter: "blur(50px)",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 70%, transparent 100%)",
            filter: "blur(30px)",
            animation: "float 10s ease-in-out infinite",
          }}
        />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(10px) rotate(240deg);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.3),
              0 0 40px rgba(34, 197, 94, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.5),
              0 0 60px rgba(34, 197, 94, 0.4);
          }
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        .glass-button {
          background: linear-gradient(
            135deg,
            rgba(168, 85, 247, 0.8),
            rgba(34, 197, 94, 0.8)
          );
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }
        .glass-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 2s infinite;
        }
        .google-button {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }
        .google-button:hover {
          background: rgba(255, 255, 255, 1);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        .disabled-button {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div className="glass-card rounded-3xl p-8 max-w-md w-full relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-2xl glass-card mb-6">
            <PlumSproutLogo className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to Plum
          </h1>
          <p className="text-purple-100 text-center">
            Sign in to start monitoring Reddit conversations
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-white text-sm">
              {error === "OAuthSignin" &&
                "Error signing in with OAuth provider"}
              {error === "OAuthCallback" && "Error in OAuth callback"}
              {error === "OAuthCreateAccount" && "Error creating OAuth account"}
              {error === "EmailCreateAccount" && "Error creating email account"}
              {error === "Callback" && "Error in authentication callback"}
              {error === "OAuthAccountNotLinked" &&
                "This email is already registered. Please sign in with the same method you used originally, or contact support if you need help."}
              {error === "SessionRequired" && "Please sign in to continue"}
              {error === "Default" && "An error occurred during sign in"}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-purple-200">
                More providers coming soon
              </span>
            </div>
          </div>

          <div className="space-y-3 opacity-60">
            <button
              disabled
              className="w-full disabled-button text-white/60 font-heading font-semibold py-4 px-6 rounded-xl cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Continue with GitHub
            </button>

            <button
              disabled
              className="w-full disabled-button text-white/60 font-heading font-semibold py-4 px-6 rounded-xl cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h18v7.5h-9V21H3V3zm10.5 10.5H21V21h-7.5v-7.5z" />
              </svg>
              Continue with Microsoft
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-white/70 font-body">
          By signing in, you agree to our{" "}
          <span className="text-white/90 hover:text-purple-300 transition-colors cursor-pointer">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-white/90 hover:text-purple-300 transition-colors cursor-pointer">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center p-4">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
