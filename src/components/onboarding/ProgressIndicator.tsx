interface Step {
  number: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}

interface ProgressIndicatorProps {
  currentStep: number;
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const steps: Step[] = [
    {
      number: 1,
      label: "Account Created",
      isActive: currentStep === 1,
      isCompleted: currentStep > 1,
    },
    {
      number: 2,
      label: "Connect Reddit",
      isActive: currentStep === 2,
      isCompleted: currentStep > 2,
    },
    {
      number: 3,
      label: "Configure",
      isActive: currentStep === 3,
      isCompleted: currentStep > 3,
    },
  ];

  return (
    <div className="flex items-center justify-between mb-12">
      {steps.map((step, index) => (
        <div key={step.number} className="flex-1">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step.isActive || step.isCompleted
                  ? "bg-white text-purple-600"
                  : "bg-white/30 text-white/60"
              }`}
            >
              {step.number}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  step.isCompleted ? "bg-white/30" : "bg-white/20"
                }`}
              />
            )}
          </div>
          <p
            className={`mt-2 ${
              step.isActive || step.isCompleted ? "text-white" : "text-white/60"
            }`}
          >
            {step.label}
          </p>
        </div>
      ))}
    </div>
  );
}