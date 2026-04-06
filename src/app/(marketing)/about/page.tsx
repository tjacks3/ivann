"use client";

import { PageContainer } from "@/components/shared/page-container";
import { useTranslation } from "@/i18n";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <PageContainer size="narrow" className="py-16 sm:py-24">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t("about.title")}
      </h1>

      <p className="mt-2 text-sm font-medium uppercase tracking-widest text-primary">
        {t("about.acronym")}
      </p>

      <div className="mt-8 space-y-6 text-base leading-7 text-muted-foreground">
        <p>{t("about.paragraph1")}</p>
        <p>{t("about.paragraph2")}</p>
        <p>{t("about.paragraph3")}</p>
        <p className="font-medium text-foreground">{t("about.tagline")}</p>
      </div>
    </PageContainer>
  );
}
