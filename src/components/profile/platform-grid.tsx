"use client";

import { PlatformCard } from "./platform-card";
import { useTranslation } from "@/i18n";

export interface PlatformData {
  platform: string;
  handle: string;
  followers: number;
  engagement?: number;
}

interface PlatformGridProps {
  platforms: PlatformData[];
}

export function PlatformGrid({ platforms }: PlatformGridProps) {
  const { t } = useTranslation();

  if (platforms.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {t("profile.noPlatforms")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {platforms.map((platform) => (
        <PlatformCard key={platform.platform} {...platform} />
      ))}
    </div>
  );
}
