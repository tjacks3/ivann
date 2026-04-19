"use client";

import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/i18n";
import { Share2, User, Settings } from "lucide-react";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <PageContainer size="narrow">
      <SectionHeader
        title={t("settings.title")}
        description={t("settings.subtitle")}
      />

      <div className="mt-6 space-y-3">
        <Card className="transition-colors hover:border-primary/30">
          <CardContent className="py-4">
            <Link href="/settings/socials" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Share2 className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("settings.socials")}</p>
                <p className="text-xs text-muted-foreground">{t("settings.socialsDescription")}</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
              <User className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("settings.account")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.accountComingSoon")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
