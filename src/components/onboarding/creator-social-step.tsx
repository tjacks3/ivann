"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n";
import { PLATFORM_ORDER, getPlatformMeta } from "@/lib/social/platforms";

const ONBOARDING_PLATFORMS = ["instagram", "youtube", "tiktok", "twitter"] as const;

export function CreatorSocialStep() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">{t("onboarding.creatorSocial.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("onboarding.creatorSocial.subtitle")}</p>
      </div>

      <div className="space-y-3">
        {ONBOARDING_PLATFORMS.map((key) => {
          const meta = getPlatformMeta(key);
          const Icon = meta.icon;
          return (
            <Card key={key} className="border-0 shadow-none">
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${meta.color}15` }}
                  >
                    <Icon className="size-4" style={{ color: meta.color }} />
                  </div>
                  <span className="text-sm font-medium">{meta.name}</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {t("onboarding.creatorSocial.comingSoon")}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {t("onboarding.creatorSocial.addLater")}{" "}
        <Link href="/settings/socials" className="font-medium text-primary hover:underline">
          {t("onboarding.creatorSocial.settingsLink")}
        </Link>
      </p>
    </div>
  );
}
