"use client";

import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { DollarSign } from "lucide-react";

const BUDGET_RANGES = [
  "under_50",
  "50_100",
  "100_250",
  "250_500",
  "500_plus",
] as const;

interface StepBudgetProps {
  budgetRange: string;
  onBudgetRangeChange: (value: string) => void;
}

export function StepBudget({
  budgetRange,
  onBudgetRangeChange,
}: StepBudgetProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{t("quickCollab.budget.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("quickCollab.budget.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {BUDGET_RANGES.map((range) => (
          <button
            key={range}
            type="button"
            onClick={() => onBudgetRangeChange(range)}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
              budgetRange === range
                ? "border-primary text-foreground"
                : "border-input text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
          >
            <DollarSign className="size-4 shrink-0" />
            <span className="text-sm font-medium">
              {t(`quickCollab.budgetOption.${range}`)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
