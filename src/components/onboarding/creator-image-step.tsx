"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useTranslation } from "@/i18n";

interface CreatorImageStepProps {
  name?: string;
}

export function CreatorImageStep({ name }: CreatorImageStepProps) {
  const { t } = useTranslation();
  const initials = (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">{t("onboarding.creatorImage.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("onboarding.creatorImage.subtitle")}</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Avatar className="size-24 text-2xl">
          <AvatarFallback>{initials || "?"}</AvatarFallback>
        </Avatar>

        <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          <Camera className="size-4" />
          {t("onboarding.creatorImage.comingSoon")}
        </div>
      </div>
    </div>
  );
}
