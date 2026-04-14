"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { BrandAvatarUpload } from "./brand-avatar-upload";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/i18n";
import { brandEditProfileSchema } from "@/lib/validations/brand-profile";
import type { BrandEditProfileValues } from "@/lib/validations/brand-profile";
import { updateBrandProfile } from "@/app/(app)/brand/profile/actions";
import type { User } from "@/db/schema/users";

const INDUSTRIES = [
  "fashion", "tech", "lifestyle", "fitness",
  "food", "travel", "education", "entertainment",
  "business", "other",
] as const;

interface BrandEditFormProps {
  profile: User;
  onSaved?: () => void;
}

export function BrandEditForm({ profile, onSaved }: BrandEditFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<BrandEditProfileValues>({
    resolver: zodResolver(brandEditProfileSchema),
    defaultValues: {
      brandName: profile.brandName || "",
      contactName: profile.contactName || "",
      companyWebsite: profile.companyWebsite || "",
      bio: profile.bio || "",
      industry: profile.industry || "",
      location: profile.location || "",
    },
  });

  const { register, formState: { errors }, setValue, watch, handleSubmit } = form;

  const onSubmit = async (data: BrandEditProfileValues) => {
    setSaving(true);
    setSuccess(false);
    setServerError(null);

    const result = await updateBrandProfile(data);

    if (result.success) {
      setSuccess(true);
      onSaved?.();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setServerError(t("brandProfile.edit.error"));
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Logo / Avatar */}
      <Card>
        <CardContent className="flex justify-center pt-6">
          <BrandAvatarUpload
            currentAvatarUrl={profile.avatarUrl ?? undefined}
            brandName={profile.brandName || ""}
            userId={profile.id}
          />
        </CardContent>
      </Card>

      {/* Brand Fields */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="brandName">{t("brandProfile.edit.brandName")}</Label>
            <Input id="brandName" {...register("brandName")} />
            {errors.brandName && <p className="text-xs text-destructive">{errors.brandName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">{t("brandProfile.edit.contactName")}</Label>
            <Input id="contactName" {...register("contactName")} />
            {errors.contactName && <p className="text-xs text-destructive">{errors.contactName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyWebsite">{t("brandProfile.edit.website")}</Label>
            <Input
              id="companyWebsite"
              placeholder={t("brandProfile.edit.websitePlaceholder")}
              {...register("companyWebsite")}
            />
            {errors.companyWebsite && <p className="text-xs text-destructive">{errors.companyWebsite.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{t("brandProfile.edit.description")}</Label>
            <Textarea
              id="bio"
              placeholder={t("brandProfile.edit.descriptionPlaceholder")}
              rows={3}
              {...register("bio")}
            />
            {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t("brandProfile.edit.industry")}</Label>
            <Select
              value={watch("industry") || ""}
              onValueChange={(val) => setValue("industry", val ?? "", { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("brandProfile.edit.industryPlaceholder")} />
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
            <Label htmlFor="location">{t("brandProfile.edit.location")}</Label>
            <Input
              id="location"
              placeholder={t("brandProfile.edit.locationPlaceholder")}
              {...register("location")}
            />
            {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="size-4" />
          {t("brandProfile.edit.success")}
        </div>
      )}
      {serverError && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/brand/dashboard")}
        >
          {t("brandProfile.edit.cancel")}
        </Button>
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />}
          {saving ? t("brandProfile.edit.saving") : t("brandProfile.edit.save")}
        </Button>
      </div>
    </form>
  );
}
