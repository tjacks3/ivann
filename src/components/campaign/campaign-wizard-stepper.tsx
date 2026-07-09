"use client";

import { Progress } from "@/components/ui/progress";

interface CampaignWizardStepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
}

export function CampaignWizardStepper({
  currentStep,
  totalSteps,
  stepLabel,
}: CampaignWizardStepperProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-muted-foreground">{stepLabel}</span>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}
