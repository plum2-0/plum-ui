"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Image from "next/image";
import { SignOutButton } from "@/components/SignOutButton";
import { PlumLogo } from "@/components/PlumLogo";
import { SourceListeningConfig } from "@/components/SourceListeningConfig";
import { useOnboardingState } from "@/hooks/useOnboardingState";

export default function ConfigureOnboardingPage() {
  const { data: session, status } = useSession();
  const [projectName, setProjectName] = useState("");
  const [configData, setConfigData] = useState({
    subreddits: [] as string[],
    topics: [] as string[],
    prompt: "",
  });
  const { state: onboardingState, loading: stateLoading } =
    useOnboardingState(false);

  const handleConfigChange = useCallback(
    (newConfig: { subreddits: string[]; topics: string[]; prompt: string }) => {
      setConfigData(newConfig);
    },
    []
  );

  useEffect(() => {
    if (status === "loading" || stateLoading) return;
    if (!session?.user) {
      redirect("/auth/signin");
    }

    // Check if user has project and Reddit config - if not, redirect appropriately
    if (onboardingState) {
      if (!onboardingState.hasProject) {
        redirect("/onboarding");
      } else if (!onboardingState.hasRedditConfig) {
        redirect("/onboarding/reddit");
      }
    }

    // Load existing data from localStorage or onboarding state
    const savedData = localStorage.getItem("onboardingData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setProjectName(parsedData.projectName || "");
    } else if (onboardingState?.projectName) {
      setProjectName(onboardingState.projectName);
    }
  }, [session, status, onboardingState, stateLoading]);

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

  const handleFinish = async () => {
    // Save configuration to localStorage for backup
    const finalConfigData = {
      projectName,
      projectId: onboardingState?.projectId,
      ...configData,
      redditConnected: true,
    };

    localStorage.setItem("onboardingData", JSON.stringify(finalConfigData));

    console.log("Configuration completed:", finalConfigData);

    // Navigate to dashboard or success page
    redirect("/");
  };

  const isValid =
    configData.subreddits.length > 0 &&
    configData.topics.length > 0 &&
    configData.prompt.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700">
      <header className="p-6 flex justify-between items-center">
        <PlumLogo />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-white">{session.user.name}</span>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
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
                <div className="w-10 h-10 bg-white/60 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  ✓
                </div>
                <div className="flex-1 h-1 bg-white/30 mx-2"></div>
              </div>
              <p className="text-white/80 mt-2">Connect Reddit</p>
            </div>

            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold">
                  3
                </div>
              </div>
              <p className="text-white mt-2">Configure</p>
            </div>
          </div>

          {/* Project Name Display */}
          {projectName && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-2">
                Project: {projectName}
              </h3>
              <p className="text-purple-200 text-sm">
                Step 3: Configuration - Set up your Reddit monitoring
                preferences
              </p>
            </div>
          )}

          {/* Source Listening Configuration Component */}
          {onboardingState?.projectId ? (
            <SourceListeningConfig
              projectId={onboardingState.projectId}
              onConfigChange={handleConfigChange}
            />
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
              <div className="text-white text-center">
                No project found. Please restart onboarding.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-12">
            <button
              onClick={() => redirect("/onboarding/reddit")}
              className="px-6 py-3 text-white/70 hover:text-white transition-colors"
            >
              ← Previous Step
            </button>
            <button
              onClick={handleFinish}
              disabled={!isValid}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              Complete Setup
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
