"use client";

import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/i18n";

interface IntakeStepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
}

export function IntakeStepper({ currentStep, totalSteps, stepLabel }: IntakeStepperProps) {
  const { t } = useTranslation();
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {t("quickCollab.step", { current: currentStep + 1, total: totalSteps })}
        </span>
        <span className="text-muted-foreground">{stepLabel}</span>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}
