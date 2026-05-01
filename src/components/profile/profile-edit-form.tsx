"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { CategorySelect } from "@/components/shared/category-select";
import { AvatarUpload } from "./avatar-upload";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/i18n";
import { creatorEditProfileSchema } from "@/lib/validations/profile";
import type { CreatorEditProfileValues } from "@/lib/validations/profile";
import { updateCreatorProfile } from "@/app/(app)/creator/profile/actions";
import type { User } from "@/db/schema/users";

interface ProfileEditFormProps {
  profile: User;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function ProfileEditForm({ profile, onSaved, onCancel }: ProfileEditFormProps) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreatorEditProfileValues>({
    resolver: zodResolver(creatorEditProfileSchema),
    defaultValues: {
      fullName: profile.fullName || "",
      username: profile.username || "",
      bio: profile.bio || "",
      categories: profile.categories || [],
      location: profile.location || "",
      website: profile.website || "",
      publicEmail: profile.publicEmail || "",
      profileStatus: (profile.profileStatus as CreatorEditProfileValues["profileStatus"]) || "draft",
    },
  });

  const { register, formState: { errors }, setValue, watch, handleSubmit } = form;

  const onSubmit = async (data: CreatorEditProfileValues) => {
    setSaving(true);
    setSuccess(false);
    setServerError(null);

    const result = await updateCreatorProfile(data);

    if (result.success) {
      setSuccess(true);
      onSaved?.();
      setTimeout(() => setSuccess(false), 3000);
    } else if (result.error === "USERNAME_EXISTS") {
      setServerError(t("auth.error.usernameTaken"));
    } else {
      setServerError(t("profile.edit.error"));
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Avatar */}
        <div className="flex justify-center">
          <AvatarUpload
            currentAvatarUrl={profile.avatarUrl ?? undefined}
            userName={profile.fullName || ""}
            userId={profile.id}
          />
        </div>

        {/* Display Name */}
        <div className="space-y-2.5">
          <Label htmlFor="fullName">{t("profile.edit.displayName")}</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        {/* Username */}
        <div className="space-y-2.5">
          <Label htmlFor="username">{t("profile.edit.username")}</Label>
          <div className="flex">
            <span className="flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">@</span>
            <Input id="username" className="rounded-l-none" {...register("username")} />
          </div>
          {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
        </div>

        {/* Bio */}
        <div className="space-y-2.5">
          <Label htmlFor="bio">{t("profile.edit.bio")}</Label>
          <Textarea
            id="bio"
            placeholder={t("profile.edit.bioPlaceholder")}
            rows={3}
            {...register("bio")}
          />
          {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
        </div>

        {/* Categories */}
        <div className="space-y-2.5">
          <Label>{t("profile.edit.categories")}</Label>
          <CategorySelect
            selected={watch("categories") ?? []}
            onChange={(cats) => setValue("categories", cats, { shouldValidate: true })}
            error={errors.categories?.message}
          />
        </div>

        {/* Location */}
        <div className="space-y-2.5">
          <Label htmlFor="location">{t("profile.edit.location")}</Label>
          <Input
            id="location"
            placeholder={t("profile.edit.locationPlaceholder")}
            {...register("location")}
          />
        </div>

        {/* Website */}
        <div className="space-y-2.5">
          <Label htmlFor="website">{t("profile.edit.website")}</Label>
          <Input
            id="website"
            placeholder={t("profile.edit.websitePlaceholder")}
            {...register("website")}
          />
          {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
        </div>

        {/* Public Email */}
        <div className="space-y-2.5">
          <Label htmlFor="publicEmail">{t("profile.edit.publicEmail")}</Label>
          <Input
            id="publicEmail"
            placeholder={t("profile.edit.publicEmailPlaceholder")}
            {...register("publicEmail")}
          />
          <p className="text-xs text-muted-foreground">{t("profile.edit.publicEmailHint")}</p>
          {errors.publicEmail && <p className="text-xs text-destructive">{errors.publicEmail.message}</p>}
        </div>

        {/* Profile Status */}
        <div className="space-y-2.5">
          <Label>{t("profile.edit.profileStatus")}</Label>
          <Select
            value={watch("profileStatus")}
            onValueChange={(val) =>
              setValue("profileStatus", val as CreatorEditProfileValues["profileStatus"], { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{t("profile.status.draft")}</SelectItem>
              <SelectItem value="published">{t("profile.status.published")}</SelectItem>
              <SelectItem value="archived">{t("profile.status.archived")}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {t(`profile.status.${watch("profileStatus")}Description`)}
          </p>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
            <CheckCircle2 className="size-4" />
            {t("profile.edit.success")}
          </div>
        )}
        {serverError && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {serverError}
          </div>
        )}
      </div>

      {/* Fixed footer */}
      <div className="shrink-0 border-t bg-background p-6">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            {t("profile.edit.cancel")}
          </Button>
          <Button type="submit" className="flex-1 cursor-pointer" disabled={saving}>
            {saving && <Loader2 className="size-3.5 animate-spin" />}
            {saving ? t("profile.edit.saving") : t("profile.edit.save")}
          </Button>
        </div>
      </div>
    </form>
  );
}
