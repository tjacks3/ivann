"use client";

import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Package } from "lucide-react";
import { useTranslation } from "@/i18n";

export default function PackagesPage() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <SectionHeader
        title={t("packages.title")}
        description={t("packages.subtitle")}
      />
      <div className="mt-8">
        <EmptyState
          icon={<Package className="size-6" />}
          title={t("packages.title")}
          description={t("packages.subtitle")}
        />
      </div>
    </PageContainer>
  );
}
