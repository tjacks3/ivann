"use client";

import type { UseFormReturn } from "react-hook-form";
import type { BrandProfileValues } from "@/lib/validations/onboarding";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/i18n";

const INDUSTRIES = [
  "fashion", "tech", "lifestyle", "fitness",
  "food", "travel", "education", "entertainment",
  "business", "other",
] as const;

interface BrandProfileStepProps {
  form: UseFormReturn<BrandProfileValues>;
}

export function BrandProfileStep({ form }: BrandProfileStepProps) {
  const { t } = useTranslation();
  const { register, formState: { errors }, setValue, watch } = form;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">{t("onboarding.brandProfile.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("onboarding.brandProfile.subtitle")}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="brandName">{t("onboarding.brandProfile.brandName")}</Label>
          <Input id="brandName" {...register("brandName")} />
          {errors.brandName && <p className="text-xs text-destructive">{errors.brandName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactName">{t("onboarding.brandProfile.contactName")}</Label>
          <Input id="contactName" {...register("contactName")} />
          {errors.contactName && <p className="text-xs text-destructive">{errors.contactName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyWebsite">{t("onboarding.brandProfile.website")}</Label>
          <Input id="companyWebsite" placeholder={t("onboarding.brandProfile.websitePlaceholder")} {...register("companyWebsite")} />
          {errors.companyWebsite && <p className="text-xs text-destructive">{errors.companyWebsite.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">{t("onboarding.brandProfile.description")}</Label>
          <Textarea
            id="bio"
            placeholder={t("onboarding.brandProfile.descriptionPlaceholder")}
            rows={3}
            {...register("bio")}
          />
          {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>{t("onboarding.brandProfile.industry")}</Label>
          <Select value={watch("industry") || ""} onValueChange={(val) => setValue("industry", val ?? "", { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder={t("onboarding.brandProfile.industryPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {t(`onboarding.category.${ind}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && <p className="text-xs text-destructive">{errors.industry.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">{t("onboarding.brandProfile.location")}</Label>
          <Input
            id="location"
            placeholder={t("onboarding.brandProfile.locationPlaceholder")}
            {...register("location")}
          />
          {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
        </div>
      </div>
    </div>
  );
}
