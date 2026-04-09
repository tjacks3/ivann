"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

const CATEGORIES = [
  "fashion", "tech", "lifestyle", "fitness",
  "food", "travel", "education", "entertainment",
  "business", "other",
] as const;

interface CategorySelectProps {
  selected: string[];
  onChange: (categories: string[]) => void;
  error?: string;
}

export function CategorySelect({ selected, onChange, error }: CategorySelectProps) {
  const { t } = useTranslation();

  const toggle = (cat: string) => {
    const next = selected.includes(cat)
      ? selected.filter((c) => c !== cat)
      : [...selected, cat];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isSelected = selected.includes(cat);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggle(cat)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {t(`onboarding.category.${cat}`)}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
