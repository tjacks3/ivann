"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import { getPlatformMeta } from "@/lib/social/platforms";
import { addManualLink } from "@/app/(app)/settings/socials/actions";
import { useTranslation } from "@/i18n";

const manualLinkSchema = z.object({
  handle: z.string().min(1, "Required").max(255),
  profileUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

type ManualLinkValues = z.infer<typeof manualLinkSchema>;

interface ManualLinkFormProps {
  platform: string;
  onClose: () => void;
  onLinked: () => void;
}

export function ManualLinkForm({ platform, onClose, onLinked }: ManualLinkFormProps) {
  const { t } = useTranslation();
  const meta = getPlatformMeta(platform);
  const Icon = meta.icon;
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ManualLinkValues>({
    resolver: zodResolver(manualLinkSchema),
    defaultValues: { handle: "", profileUrl: "" },
  });

  const onSubmit = async (data: ManualLinkValues) => {
    setSaving(true);
    setServerError(null);

    const result = await addManualLink({
      platform,
      handle: data.handle,
      profileUrl: data.profileUrl || undefined,
    });

    if (result.success) {
      onLinked();
    } else if (result.error === "ALREADY_LINKED") {
      setServerError(t("social.alreadyLinked"));
    } else {
      setServerError(t("social.linkError"));
    }

    setSaving(false);
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex size-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${meta.color}15` }}
            >
              <Icon className="size-4" style={{ color: meta.color }} />
            </div>
            <p className="font-medium text-sm">
              {t("social.addPlatform", { platform: meta.name })}
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="handle" className="text-xs">
              {platform === "website" ? t("social.urlLabel") : t("social.handleLabel")}
            </Label>
            <Input
              id="handle"
              placeholder={
                platform === "website"
                  ? "https://yoursite.com"
                  : `${meta.handlePrefix}username`
              }
              {...register("handle")}
            />
            {errors.handle && (
              <p className="text-xs text-destructive">{errors.handle.message}</p>
            )}
          </div>

          {platform !== "website" && (
            <div className="space-y-1.5">
              <Label htmlFor="profileUrl" className="text-xs">
                {t("social.profileUrlLabel")}
              </Label>
              <Input
                id="profileUrl"
                placeholder={
                  meta.urlPattern
                    ? `https://${meta.urlPattern}username`
                    : "https://..."
                }
                {...register("profileUrl")}
              />
              {errors.profileUrl && (
                <p className="text-xs text-destructive">{errors.profileUrl.message}</p>
              )}
            </div>
          )}

          {serverError && (
            <p className="text-xs text-destructive">{serverError}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" size="sm" variant="outline" onClick={onClose} className="flex-1">
              {t("social.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={saving} className="flex-1">
              {saving && <Loader2 className="size-3 animate-spin" />}
              {t("social.save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
