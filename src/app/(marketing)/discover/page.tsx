"use client";

import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Compass } from "lucide-react";
import { useTranslation } from "@/i18n";

export default function DiscoverPage() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <SectionHeader
        title={t("discover.title")}
        description={t("discover.subtitle")}
      />
      <div className="mt-8">
        <EmptyState
          icon={<Compass className="size-6" />}
          title={t("discover.emptyTitle")}
          description={t("discover.emptyDescription")}
        />
      </div>
    </PageContainer>
  );
}
