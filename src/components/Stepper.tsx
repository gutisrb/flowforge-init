// src/components/Stepper.tsx
import React from "react";

type Step = { key: number; label: string };

interface StepperProps {
  currentStep: number;              // 1-based index of the active step
  steps?: Step[];                   // optional; defaults to 3 steps
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  steps,
  className = ""
}) => {
  // Default to 3 steps if none provided
  const defaultSteps: Step[] = [
    { key: 1, label: "Detalji" },
    { key: 2, label: "Fotografije" },
    { key: 3, label: "Pregled" },
  ];

  const items = Array.isArray(steps) && steps.length > 0 ? steps : defaultSteps;

  const active = Math.min(Math.max(Number(currentStep) || 1, 1), items.length);

  return (
    <div className={`w-full flex items-center ${className}`}>
      {items.map((step, idx) => {
        const isDone = step.key < active;
        const isActive = step.key === active;
        const isLast = idx === items.length - 1;

        return (
          <div key={step.key} className="flex items-center w-full">
            {/* Circle */}
            <div
              className={[
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                isDone ? "bg-green-600 text-white" :
                isActive ? "bg-primary text-white" :
                "bg-muted text-foreground/70"
              ].join(" ")}
            >
              {step.key}
            </div>

            {/* Label */}
            <div className="ml-2 text-sm">
              <div className={isActive ? "font-semibold" : ""}>{step.label}</div>
            </div>

            {/* Line to next */}
            {!isLast && (
              <div
                className={[
                  "flex-1 h-[2px] mx-3",
                  isDone ? "bg-green-600" :
                  isActive ? "bg-primary/60" :
                  "bg-muted"
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
