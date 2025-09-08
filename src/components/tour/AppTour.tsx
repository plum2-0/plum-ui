"use client";

import { TourProvider, useTour } from "@reactour/tour";
import { useAppTour } from "@/contexts/TourContext";
import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const tourSteps = [
  {
    selector: "body",
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white">Welcome to Plum! 🌱</h3>
        <p className="text-sm text-white/80 leading-relaxed">
          Let's take a quick tour to help you discover and engage with potential
          customers on Reddit.
        </p>
        <p className="text-xs text-white/60 mt-2">
          💡 Tip: You can use the arrow keys to navigate or click "Next" to
          continue
        </p>
      </div>
    ),
  },
  {
    selector: '[data-tour="prospect-target-stat"]',
    content: (
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white">Review Your Leads</h3>
        <p className="text-sm text-white/80 leading-relaxed">
          Click this card to view all potential customers we've found for you.
        </p>
        <div className="bg-white/5 rounded-lg p-2 mt-2">
          <p className="text-xs text-white/70">
            <span className="text-emerald-400">✓ Swipe Right</span> on relevant
            posts
          </p>
          <p className="text-xs text-white/70 mt-1">
            <span className="text-red-400">✗ Swipe Left</span> to skip
            irrelevant ones
          </p>
        </div>
      </div>
    ),
  },
  {
    selector: '[data-tour="sidebar-leads"]',
    content: (
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white">Your Lead Inbox</h3>
        <p className="text-sm text-white/80 leading-relaxed">
          Click here to access all the people you've swiped right on.
        </p>
        <p className="text-xs text-white/60 mt-2">
          📬 This is where you'll craft personalized messages and engage with
          your leads
        </p>
      </div>
    ),
  },
  {
    selector: '[data-tour="quick-add-keyword"]',
    content: (
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white">Expand Your Search</h3>
        <p className="text-sm text-white/80 leading-relaxed">
          Click the + button to add new keywords and find more leads across
          Reddit.
        </p>
        <div className="bg-white/5 rounded-lg p-2 mt-2">
          <p className="text-xs text-white/70">
            💡 Pro tip: Use specific keywords related to problems your product
            solves
          </p>
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white">You're All Set! 🎉</h3>
        <p className="text-sm text-white/80 leading-relaxed">
          You now know the basics of finding and engaging with leads on Plum.
        </p>
        <div className="bg-gradient-to-r from-emerald-500/10 to-purple-500/10 rounded-lg p-3 mt-3 border border-white/10">
          <p className="text-sm text-white font-medium mb-2">Next steps:</p>
          <ul className="space-y-1 text-xs text-white/70">
            <li>• Review your potential leads</li>
            <li>• Add keywords to expand your search</li>
            <li>• Check your inbox for accepted leads</li>
          </ul>
        </div>
        <p className="text-xs text-white/50 mt-3">
          You can restart this tour anytime by clicking the ℹ️ button
        </p>
      </div>
    ),
    selector: "body",
  },
];

// Custom styles matching the glassmorphism design
const tourStyles = {
  popover: (base: any, { currentStep }: any) => ({
    ...base,
    background:
      "linear-gradient(145deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.10) 100%)",
    backdropFilter: "blur(20px) saturate(1.2)",
    WebkitBackdropFilter: "blur(20px) saturate(1.2)",
    border: "2px solid rgba(255, 255, 255, 0.38)",
    boxShadow:
      "0 12px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.18)",
    borderRadius: "16px",
    padding: "24px",
    paddingBottom: "20px",
    color: "white",
    maxWidth: "420px",
    minWidth: "380px",
    // Add left margin for step 2 (sidebar leads - index 2)
    marginLeft: currentStep === 2 ? "20px" : "0",
  }),
  mask: (base: any) => ({
    ...base,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  }),
  maskArea: (base: any) => ({
    ...base,
    rx: 12,
  }),
  badge: (base: any) => ({
    ...base,
    background:
      "linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(34, 197, 94, 0.3) 100%)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    fontWeight: "bold",
  }),
  controls: (base: any) => ({
    ...base,
    marginTop: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }),
  arrow: (base: any) => ({
    ...base,
    color: "rgba(255, 255, 255, 0.8)",
  }),
  dot: (base: any, { current }: any) => ({
    ...base,
    background: current
      ? "linear-gradient(135deg, rgba(168, 85, 247, 0.8) 0%, rgba(34, 197, 94, 0.8) 100%)"
      : "rgba(255, 255, 255, 0.3)",
    width: current ? "24px" : "8px",
    height: "8px",
    borderRadius: current ? "4px" : "50%",
    transition: "all 0.3s ease",
  }),
  close: (base: any) => ({
    ...base,
    color: "rgba(255, 255, 255, 0.8)",
    ":hover": {
      color: "white",
    },
  }),
};

// Custom close button component
function CustomCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute -top-2 -right-2 p-1.5 rounded-lg transition-all hover:bg-white/10 z-10"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <X className="w-3.5 h-3.5 text-white/60 hover:text-white/80" />
    </button>
  );
}

// Custom navigation component
function CustomNavigation({
  currentStep,
  stepsLength,
  setCurrentStep,
  setIsOpen,
}: {
  currentStep: number;
  stepsLength: number;
  setCurrentStep: (step: number) => void;
  setIsOpen?: (open: boolean) => void;
}) {
  const { completeTour } = useAppTour();
  const isLastStep = currentStep === stepsLength - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      completeTour();
      setIsOpen?.(false);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    completeTour();
    setIsOpen?.(false);
  };

  return (
    <div className="space-y-4 mt-6">
      {/* Progress indicator with step counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Step counter */}
          <span className="text-xs text-white/50">
            Step {currentStep + 1} of {stepsLength}
          </span>
          {/* Dots indicator */}
          <div className="flex gap-1.5">
            {Array.from({ length: stepsLength }).map((_, index) => (
              <div
                key={index}
                className="transition-all duration-300"
                style={{
                  width: index === currentStep ? "20px" : "6px",
                  height: "6px",
                  borderRadius: index === currentStep ? "3px" : "50%",
                  background:
                    index === currentStep
                      ? "linear-gradient(135deg, rgba(168, 85, 247, 0.8) 0%, rgba(34, 197, 94, 0.8) 100%)"
                      : index < currentStep
                      ? "rgba(168, 85, 247, 0.5)"
                      : "rgba(255, 255, 255, 0.2)",
                }}
              />
            ))}
          </div>
        </div>
        {/* Skip button - only show if not on last step */}
        {!isLastStep && (
          <button
            onClick={handleSkip}
            className="text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Skip tour
          </button>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {!isFirstStep && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all hover:transform hover:-translate-y-0.5"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow:
                  "0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Back</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Keyboard hint */}
          {!isLastStep && (
            <span className="text-xs text-white/30">Press → or Enter</span>
          )}
          <button
            onClick={handleNext}
            className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:transform hover:-translate-y-0.5 group"
            style={{
              background: isLastStep
                ? "linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%)"
                : "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)",
              border: isLastStep
                ? "1px solid rgba(34, 197, 94, 0.4)"
                : "1px solid rgba(168, 85, 247, 0.3)",
              boxShadow: isLastStep
                ? "0 4px 12px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                : "0 4px 12px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            <span className="text-sm font-bold">
              {isLastStep ? "Finish Tour" : isFirstStep ? "Start Tour" : "Next"}
            </span>
            {!isLastStep && (
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Inner component that uses the tour hook
function TourContent() {
  const { setIsOpen } = useTour();
  const { isActive } = useAppTour();

  useEffect(() => {
    setIsOpen(isActive);
  }, [isActive, setIsOpen]);

  // no-op: handled via provider components

  return null; // The tour UI is handled by the TourProvider
}

// Main tour component
export default function AppTour({ children }: { children: React.ReactNode }) {
  const { shouldShowTour } = useAppTour();

  return (
    <TourProvider
      steps={tourSteps}
      styles={tourStyles}
      showNavigation={false}
      showCloseButton={false}
      showBadge={false}
      disableInteraction={true}
      disableFocusLock={false}
      disableDotsNavigation={false}
      disableKeyboardNavigation={false}
      maskClassName="!bg-black/60"
      onClickMask={() => {}}
      components={{
        Content: ({ currentStep, content, setCurrentStep, setIsOpen }) => {
          const { completeTour, setIsActive } = useAppTour();
          const totalSteps = tourSteps.length; // Get the actual number of steps
          return (
            <div className="relative">
              {/* Close button */}
              <CustomCloseButton
                onClick={() => {
                  completeTour();
                  setIsActive(false);
                  setIsOpen?.(false);
                }}
              />
              {/* Main content */}
              <div>{content}</div>
              {/* Navigation */}
              <CustomNavigation
                currentStep={currentStep}
                stepsLength={totalSteps}
                setCurrentStep={setCurrentStep}
                setIsOpen={setIsOpen}
              />
            </div>
          );
        },
      }}
    >
      {children}
      {shouldShowTour && <TourContent />}
    </TourProvider>
  );
}
