"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { StepContent } from "@/components/onboarding/StepContent";
import { useOnboardingState } from "@/hooks/useOnboardingState";

function OnboardingContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [projectName, setProjectName] = useState("");
  const { state: onboardingState, loading: stateLoading } = useOnboardingState();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      redirect("/auth/signin");
    }

    // Check if redirected from Reddit callback
    const step = searchParams.get("step");
    const redditStatus = searchParams.get("reddit");
    if (step === "2" && redditStatus === "connected") {
      redirect("/onboarding/reddit?reddit=connected");
    }

    // Load existing data from localStorage or from onboarding state
    const savedData = localStorage.getItem("onboardingData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setProjectName(parsedData.projectName || "");
    } else if (onboardingState?.projectName) {
      setProjectName(onboardingState.projectName);
    }
  }, [session, status, searchParams, onboardingState]);

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

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };

  // Use the current step from onboarding state, default to 1
  const currentStep = onboardingState?.currentStep || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700">
      <OnboardingHeader session={session} />

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Plum!
          </h1>
          <p className="text-xl text-purple-100 mb-12">
            Let&apos;s set up your Reddit monitoring in just a few steps.
          </p>

          <ProgressIndicator currentStep={currentStep} />

          <StepContent
            currentStep={currentStep}
            projectName={projectName}
            onProjectNameChange={handleProjectNameChange}
          />
        </div>
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
