"use client";

import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useTranslation } from "@/i18n";
import Link from "next/link";

export default function BrandDashboardPage() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <SectionHeader
        title={t("brandDashboard.title")}
        description={t("brandDashboard.subtitle")}
      />
      <div className="mt-8">
        <EmptyState
          icon={<LayoutDashboard className="size-6" />}
          title={t("brandDashboard.emptyTitle")}
          description={t("brandDashboard.emptyDescription")}
          action={
            <Button render={<Link href="/discover" />}>
              {t("nav.discover")}
            </Button>
          }
        />
      </div>
    </PageContainer>
  );
}
