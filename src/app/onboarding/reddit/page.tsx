"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import { PlumLogo } from "@/components/PlumLogo";
import { getProjectIdFromCookie } from "@/lib/cookies";
import { useOnboardingState } from "@/hooks/useOnboardingState";

function RedditOnboardingContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);
  const [redditConnected, setRedditConnected] = useState(false);
  const [redditUsername, setRedditUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    state: onboardingState,
    loading: stateLoading,
    refetch,
  } = useOnboardingState(false);

  const fetchRedditUsername = useCallback(async () => {
    try {
      const response = await fetch("/api/projects/source");
      if (response.ok) {
        const data = await response.json();
        if (data.source?.reddit?.username) {
          setRedditUsername(data.source.reddit.username);
        }
      }
    } catch (error) {
      console.error("Failed to fetch Reddit username:", error);
    }
  }, []);

  // Handle URL parameters separately to avoid re-triggers
  useEffect(() => {
    const redditStatus = searchParams.get("reddit");
    const errorParam = searchParams.get("error");

    if (redditStatus === "connected" && !redditConnected) {
      setRedditConnected(true);
      // Fetch Reddit username from project data
      fetchRedditUsername();
      // Refresh onboarding state after connection with a delay to ensure DB is updated
      setTimeout(() => {
        refetch();
      }, 2000);
    }

    if (errorParam) {
      const errorMessages: Record<string, string> = {
        reddit_denied: "You denied access to Reddit. Please try again.",
        invalid_request: "Invalid request. Please try again.",
        invalid_state: "Security validation failed. Please try again.",
        configuration_error:
          "Server configuration error. Please contact support.",
        token_exchange_failed: "Failed to connect to Reddit. Please try again.",
        user_info_failed: "Failed to get Reddit user info. Please try again.",
        callback_error: "An unexpected error occurred. Please try again.",
      };
      setError(
        errorMessages[errorParam] || "An error occurred. Please try again."
      );
    }
  }, [searchParams, redditConnected, refetch, fetchRedditUsername]);

  // Handle authentication and onboarding state
  useEffect(() => {
    if (status === "loading" || stateLoading) return;
    if (!session?.user) {
      redirect("/auth/signin");
    }

    // Check if user has project - if not, redirect to step 1
    if (onboardingState && !onboardingState.hasProject) {
      redirect("/onboarding");
    }

    // Check if user already has Reddit connected
    if (onboardingState?.hasRedditConfig && !redditConnected) {
      setRedditConnected(true);
      fetchRedditUsername();
    }

    // Store project name in cookie for callback
    const projectName = localStorage.getItem("onboardingData");
    if (projectName) {
      document.cookie = `project_name=${
        JSON.parse(projectName).projectName
      }; path=/; max-age=600`;
    }
  }, [
    session,
    status,
    onboardingState,
    stateLoading,
    redditConnected,
    fetchRedditUsername,
  ]);

  if (status === "loading" || stateLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const handleConnectReddit = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch("/api/connections/reddit/connect");
      const data = await response.json();

      if (data.authUrl) {
        // Redirect to Reddit OAuth
        window.location.href = data.authUrl;
      } else {
        setError("Failed to generate authorization URL");
        setIsConnecting(false);
      }
    } catch {
      setError("Failed to connect to Reddit. Please try again.");
      setIsConnecting(false);
    }
  };

  const handleNext = () => {
    // Save Reddit connection status
    const existingData = JSON.parse(
      localStorage.getItem("onboardingData") || "{}"
    );
    const projectId = getProjectIdFromCookie();
    localStorage.setItem(
      "onboardingData",
      JSON.stringify({
        ...existingData,
        redditConnected: true,
        redditUsername,
        projectId,
      })
    );

    // Navigate to configuration wizard
    redirect("/onboarding/configure");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700">
      <header className="p-6 flex justify-between items-center">
        <PlumLogo />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-white">{session.user.name}</span>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">
            Connect Your Reddit Account
          </h1>
          <p className="text-xl text-purple-100 mb-12">
            Let&apos;s connect your Reddit account to monitor your favorite
            subreddits.
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/60 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  ✓
                </div>
                <div className="flex-1 h-1 bg-white/30 mx-2"></div>
              </div>
              <p className="text-white/80 mt-2">Account Created</p>
            </div>

            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold">
                  2
                </div>
                <div className="flex-1 h-1 bg-white/20 mx-2"></div>
              </div>
              <p className="text-white mt-2">Connect Reddit</p>
            </div>

            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center text-white/60 font-bold">
                  3
                </div>
              </div>
              <p className="text-white/60 mt-2">Configure</p>
            </div>
          </div>

          {/* Current Step Content */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Step 2: Connect Reddit
            </h2>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                <p className="text-white">{error}</p>
              </div>
            )}

            {!redditConnected ? (
              <>
                <p className="text-purple-100 mb-6">
                  Connect your Reddit account to allow Plum to monitor your
                  selected subreddits for keywords.
                </p>

                <div className="bg-white/10 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    What we&apos;ll access:
                  </h3>
                  <ul className="space-y-2 text-purple-100">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      Your Reddit username and profile
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      Read posts and comments from subreddits
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      View your subscribed subreddits and history
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-400 mr-2">⚠</span>
                      Post, edit, and vote on your behalf
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-400 mr-2">⚠</span>
                      Access private messages and inbox
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-400 mr-2">⚠</span>
                      Moderation capabilities (if you&apos;re a moderator)
                    </li>
                  </ul>

                  <div className="mt-4 p-3 bg-amber-600/20 border border-amber-500/50 rounded">
                    <p className="text-sm text-amber-200">
                      <strong>⚠️ Extended Permissions:</strong> These
                      permissions include full read/write access to your Reddit
                      account. Only approve if you trust this application with
                      complete access.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleConnectReddit}
                  disabled={isConnecting}
                  className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-3"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                      </svg>
                      Connect Reddit Account
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Reddit Connected!
                      </h3>
                      {redditUsername && (
                        <p className="text-green-100">
                          Connected as u/{redditUsername}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-purple-100 mb-6">
                  Great! Your Reddit account is now connected. Let&apos;s move
                  on to configuring your monitoring settings.
                </p>
              </>
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={() => redirect("/onboarding")}
                className="text-white/70 hover:text-white transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={handleNext}
                disabled={!redditConnected}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                Next Step →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RedditOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <RedditOnboardingContent />
    </Suspense>
  );
}
