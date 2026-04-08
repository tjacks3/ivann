"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Play, Bird, Globe } from "lucide-react";
import { useTranslation } from "@/i18n";

const PLATFORMS = [
  { key: "instagram", icon: Camera },
  { key: "youtube", icon: Play },
  { key: "tiktok", icon: Globe },
  { key: "twitter", icon: Bird },
];

export function CreatorSocialStep() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">{t("onboarding.creatorSocial.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("onboarding.creatorSocial.subtitle")}</p>
      </div>

      <div className="space-y-3">
        {PLATFORMS.map(({ key, icon: Icon }) => (
          <Card key={key} className="border-0 shadow-none">
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4 text-primary" />
                </div>
                <span className="text-sm font-medium capitalize">{key}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {t("onboarding.creatorSocial.comingSoon")}
                </Badge>
                <Button size="sm" variant="outline" disabled>
                  {t("onboarding.creatorSocial.connect")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
