interface Props {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = [
  "Connect WhatsApp",
  "Business Profile",
  "Team Setup",
  "First Template",
  "Test Connection",
];

export function OnboardingProgress({ currentStep, totalSteps }: Props) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex justify-between text-xs text-gray-500">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span>{STEP_LABELS[currentStep - 1]}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < currentStep ? "bg-green-500" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
