"use client";

import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

const BUSINESS_CATEGORIES = [
  "fashion",
  "tech",
  "lifestyle",
  "fitness",
  "food",
  "travel",
  "education",
  "entertainment",
  "business",
  "other",
] as const;

interface StepBusinessInfoProps {
  businessName: string;
  businessCategory: string;
  onBusinessCategoryChange: (value: string) => void;
}

export function StepBusinessInfo({
  businessName,
  businessCategory,
  onBusinessCategoryChange,
}: StepBusinessInfoProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{t("quickCollab.businessInfo.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("quickCollab.businessInfo.subtitle")}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>{t("quickCollab.businessInfo.name")}</Label>
          <p className="text-sm font-medium">{businessName}</p>
        </div>

        <div className="space-y-2">
          <Label>{t("quickCollab.businessInfo.category")}</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {BUSINESS_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onBusinessCategoryChange(cat)}
                className={cn(
                  "cursor-pointer rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                  businessCategory === cat
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                {t(`onboarding.category.${cat}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
