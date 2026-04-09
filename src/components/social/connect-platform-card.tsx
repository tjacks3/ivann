"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPlatformMeta, OAUTH_PLATFORMS } from "@/lib/social/platforms";
import { useTranslation } from "@/i18n";

interface ConnectPlatformCardProps {
  platform: string;
  onManualAdd: (platform: string) => void;
}

export function ConnectPlatformCard({ platform, onManualAdd }: ConnectPlatformCardProps) {
  const { t } = useTranslation();
  const meta = getPlatformMeta(platform);
  const Icon = meta.icon;
  const isOAuth = (OAUTH_PLATFORMS as readonly string[]).includes(platform);

  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${meta.color}15` }}
        >
          <Icon className="size-5" style={{ color: meta.color }} />
        </div>

        <div className="flex-1">
          <p className="font-medium">{meta.name}</p>
          {isOAuth && (
            <Badge variant="secondary" className="mt-0.5 text-[10px]">
              {t("social.oauthComingSoon")}
            </Badge>
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onManualAdd(platform)}
        >
          {t("social.addManually")}
        </Button>
      </CardContent>
    </Card>
  );
}
