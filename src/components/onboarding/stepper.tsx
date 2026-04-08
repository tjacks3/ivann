"use client";

import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/i18n";

interface StepperProps {
  steps: { label: string }[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  const { t } = useTranslation();
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {t("onboarding.step", { current: currentStep + 1, total: steps.length })}
        </span>
        <span className="text-muted-foreground">{steps[currentStep]?.label}</span>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}
