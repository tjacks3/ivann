"use client";

import type { UseFormReturn } from "react-hook-form";
import type { CreatorProfileValues } from "@/lib/validations/onboarding";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "fashion", "tech", "lifestyle", "fitness",
  "food", "travel", "education", "entertainment",
  "business", "other",
] as const;

interface CreatorProfileStepProps {
  form: UseFormReturn<CreatorProfileValues>;
}

export function CreatorProfileStep({ form }: CreatorProfileStepProps) {
  const { t } = useTranslation();
  const { register, formState: { errors }, setValue, watch } = form;
  const selected = watch("categories") ?? [];

  const toggleCategory = (cat: string) => {
    const next = selected.includes(cat)
      ? selected.filter((c) => c !== cat)
      : [...selected, cat];
    setValue("categories", next, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">{t("onboarding.creatorProfile.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("onboarding.creatorProfile.subtitle")}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">{t("onboarding.creatorProfile.displayName")}</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">{t("onboarding.creatorProfile.username")}</Label>
          <div className="flex">
            <span className="flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">@</span>
            <Input id="username" className="rounded-l-none" {...register("username")} />
          </div>
          {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">{t("onboarding.creatorProfile.bio")}</Label>
          <Textarea
            id="bio"
            placeholder={t("onboarding.creatorProfile.bioPlaceholder")}
            rows={3}
            {...register("bio")}
          />
          {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>{t("onboarding.creatorProfile.categories")}</Label>
          <p className="text-xs text-muted-foreground">{t("onboarding.creatorProfile.categoriesHint")}</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selected.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
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
          {errors.categories && <p className="text-xs text-destructive">{errors.categories.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">{t("onboarding.creatorProfile.location")}</Label>
          <Input id="location" placeholder={t("onboarding.creatorProfile.locationPlaceholder")} {...register("location")} />
        </div>
      </div>
    </div>
  );
}
