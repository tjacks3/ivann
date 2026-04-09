"use client";

import type { UseFormReturn } from "react-hook-form";
import type { CreatorProfileValues } from "@/lib/validations/onboarding";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategorySelect } from "@/components/shared/category-select";
import { useTranslation } from "@/i18n";

interface CreatorProfileStepProps {
  form: UseFormReturn<CreatorProfileValues>;
}

export function CreatorProfileStep({ form }: CreatorProfileStepProps) {
  const { t } = useTranslation();
  const { register, formState: { errors }, setValue, watch } = form;
  const selected = watch("categories") ?? [];

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
          <CategorySelect
            selected={selected}
            onChange={(cats) => setValue("categories", cats, { shouldValidate: true })}
            error={errors.categories?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">{t("onboarding.creatorProfile.location")}</Label>
          <Input id="location" placeholder={t("onboarding.creatorProfile.locationPlaceholder")} {...register("location")} />
        </div>
      </div>
    </div>
  );
}
