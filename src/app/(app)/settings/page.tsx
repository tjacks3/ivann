"use client";

import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { useTranslation } from "@/i18n";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <PageContainer size="narrow">
      <SectionHeader
        title={t("settings.title")}
        description={t("settings.subtitle")}
      />
    </PageContainer>
  );
}
