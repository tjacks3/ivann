"use client";

import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { LoadingState } from "@/components/shared/loading-state";
import { TrackingList } from "@/components/quick-collab/tracking-list";
import { buttonVariants } from "@/components/ui/button-variants";
import { useQuickCollabTracking } from "@/hooks/use-quick-collab-tracking";
import { useTranslation } from "@/i18n";
import { ArrowLeft, Zap } from "lucide-react";

export default function QuickCollabTrackingPage() {
  const { t } = useTranslation();
  const {
    outreaches,
    allOutreaches,
    isLoading,
    statusFilter,
    setStatusFilter,
  } = useQuickCollabTracking();

  return (
    <PageContainer size="narrow">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/brand/dashboard"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-3.5" />
          {t("quickCollab.backToDashboard")}
        </Link>
      </div>

      <SectionHeader
        title={t("quickCollab.tracking.title")}
        description={t("quickCollab.tracking.subtitle")}
        action={
          <Link
            href="/brand/quick-collab"
            className={buttonVariants({ size: "sm" })}
          >
            <Zap className="size-3.5" />
            {t("quickCollab.tracking.newQuickCollab")}
          </Link>
        }
      />

      <div className="mt-6">
        {isLoading ? (
          <LoadingState variant="skeleton" count={3} />
        ) : (
          <TrackingList
            outreaches={outreaches}
            allOutreaches={allOutreaches}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        )}
      </div>
    </PageContainer>
  );
}
