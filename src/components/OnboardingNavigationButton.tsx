"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface OnboardingNavigationButtonProps {
  projectName?: string;
}

export function OnboardingNavigationButton({
  projectName,
}: OnboardingNavigationButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingProjectId, setExistingProjectId] = useState<string | null>(null);

  // Check if user already has a project on component mount
  useEffect(() => {
    const checkExistingProject = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch("/api/onboarding/state");
        if (response.ok) {
          const data = await response.json();
          if (data.hasProject && data.projectId) {
            setExistingProjectId(data.projectId);
          }
        }
      } catch (err) {
        console.error("Error checking existing project:", err);
      }
    };

    checkExistingProject();
  }, [session?.user?.id]);

  const handleNavigation = async () => {
    if (!session?.user?.id) {
      setError("User not authenticated");
      return;
    }

    // If user already has a project, just navigate
    if (existingProjectId) {
      // Update localStorage with existing project info
      const existingData = localStorage.getItem("onboardingData");
      const onboardingData = existingData ? JSON.parse(existingData) : {};

      onboardingData.projectId = existingProjectId;
      localStorage.setItem("onboardingData", JSON.stringify(onboardingData));

      // Set cookie for project ID
      document.cookie = `project_id=${existingProjectId}; path=/; max-age=${60 * 60 * 24 * 7}`;

      // Navigate to Reddit connection page
      router.push("/onboarding/reddit");
      return;
    }

    // Otherwise, create new project
    if (!projectName?.trim()) {
      setError("Project name is required");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Create the project via API
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_name: projectName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      // Save project data to localStorage for the rest of the onboarding flow
      const existingData = localStorage.getItem("onboardingData");
      const onboardingData = existingData ? JSON.parse(existingData) : {};

      onboardingData.projectName = projectName;
      onboardingData.projectId = data.project_id;
      localStorage.setItem("onboardingData", JSON.stringify(onboardingData));

      // Set cookie for project ID
      document.cookie = `project_id=${data.project_id}; path=/; max-age=${60 * 60 * 24 * 7}`;

      // Navigate to Reddit connection page
      router.push("/onboarding/reddit");
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}
      <button
        className="bg-white hover:bg-gray-100 text-purple-600 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        onClick={handleNavigation}
        disabled={
          (!existingProjectId && projectName !== undefined && !projectName.trim()) || isCreating
        }
      >
        {isCreating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            {existingProjectId ? "Loading..." : "Creating Project..."}
          </>
        ) : (
          <>
            {existingProjectId ? "Continue →" : "Continue to Reddit Connection →"}
          </>
        )}
      </button>
    </div>
  );
}
