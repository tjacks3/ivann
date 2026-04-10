"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Users } from "lucide-react";
import { useTranslation } from "@/i18n";

export function RelatedCreators() {
  const { t } = useTranslation();

  return (
    <div>
      <SectionHeader title={t("publicProfile.relatedCreators")} as="h2" />
      <div className="mt-4">
        <EmptyState
          icon={<Users className="size-6" />}
          title={t("publicProfile.relatedComingSoon")}
          description={t("publicProfile.relatedDescription")}
        />
      </div>
    </div>
  );
}
