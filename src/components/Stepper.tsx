import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export const Stepper = ({ steps, currentStep }: StepperProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200
                    ${isCompleted 
                      ? 'bg-primary text-primary-foreground' 
                      : isCurrent 
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                
                <div className="mt-3 text-center">
                  <div
                    className={`
                      text-sm font-medium
                      ${isCurrent || isCompleted 
                        ? 'text-text-primary' 
                        : 'text-text-muted'
                      }
                    `}
                  >
                    {step.title}
                  </div>
                  <div
                    className={`
                      text-xs mt-1
                      ${isCurrent || isCompleted 
                        ? 'text-text-muted' 
                        : 'text-text-subtle'
                      }
                    `}
                  >
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 mt-[-30px]">
                  <div
                    className={`
                      h-[2px] transition-all duration-200
                      ${isCompleted 
                        ? 'bg-primary' 
                        : 'bg-border'
                      }
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};