import { ReactNode } from "react";
import { OnboardingNavigationButton } from "@/components/OnboardingNavigationButton";
import { ProjectNameInput } from "./ProjectNameInput";

interface StepContentProps {
  currentStep: number;
  projectName: string;
  onProjectNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function StepContent({
  currentStep,
  projectName,
  onProjectNameChange,
}: StepContentProps) {
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">
              Step 1: Account Created ✓
            </h2>
            <p className="text-purple-100 mb-6">
              Great! You&apos;ve successfully created your Plum account using
              Google.
            </p>
            <ProjectNameInput
              value={projectName}
              onChange={onProjectNameChange}
            />
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">
              Step 2: Connect Reddit
            </h2>
            <p className="text-purple-100 mb-6">
              Connect your Reddit account to start monitoring conversations.
            </p>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">
              Step 3: Configure Monitoring
            </h2>
            <p className="text-purple-100 mb-6">
              Set up your keywords and subreddits to monitor.
            </p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
      {renderStepContent()}
      <div className="flex justify-between">
        <button
          className="text-white/70 hover:text-white transition-colors"
          disabled={currentStep === 1}
        >
          ← Previous
        </button>
        <OnboardingNavigationButton projectName={projectName} />
      </div>
    </div>
  );
}