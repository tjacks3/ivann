"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getPlatformMeta } from "@/lib/social/platforms";
import { unlinkAccount } from "@/app/(app)/settings/socials/actions";
import { useTranslation } from "@/i18n";
import type { SocialAccount } from "@/db/schema/social-accounts";

const statusStyles: Record<string, string> = {
  connected: "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
  manual: "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  error: "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400",
  expired: "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
};

interface LinkedAccountCardProps {
  account: SocialAccount;
  onUnlinked: () => void;
}

export function LinkedAccountCard({ account, onUnlinked }: LinkedAccountCardProps) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const meta = getPlatformMeta(account.platform);
  const Icon = meta.icon;

  const handleUnlink = async () => {
    setUnlinking(true);
    await unlinkAccount(account.id);
    onUnlinked();
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${meta.color}15` }}
        >
          <Icon className="size-5" style={{ color: meta.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium">{meta.name}</p>
            <span
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${statusStyles[account.status] ?? ""}`}
            >
              {t(`social.status.${account.status}`)}
            </span>
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {meta.handlePrefix}{account.handle}
          </p>
        </div>

        {confirming ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={unlinking}
              onClick={handleUnlink}
            >
              {unlinking && <Loader2 className="size-3 animate-spin" />}
              {t("social.confirmUnlink")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirming(false)}
            >
              {t("social.cancel")}
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => setConfirming(true)}
          >
            {t("social.unlink")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
