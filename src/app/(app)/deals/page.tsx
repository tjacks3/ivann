"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { DealsDashboardSection } from "@/components/deals/deals-dashboard-section";
import { useMyDeals } from "@/hooks/use-deals";
import { useCollaborations } from "@/hooks/use-collaborations";
import { useUser } from "@/hooks/use-user";
import { useTranslation } from "@/i18n";
import { Compass } from "lucide-react";

export default function DealsPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { deals, isLoading: dealsLoading } = useMyDeals();
  const { collaborations, isLoading: collabsLoading } = useCollaborations();
  const isBrand = user?.role === "brand";

  return (
    <PageContainer>
      <SectionHeader
        title={t("deal.pageTitle")}
        description={t("deal.pageSubtitle")}
      />

      <div className="mt-8">
        <DealsDashboardSection
          deals={deals}
          collaborations={collaborations}
          isLoading={dealsLoading || collabsLoading}
          isBrand={!!isBrand}
          showHeader={false}
          emptyAction={
            isBrand ? (
              <Link href="/discover">
                <Button variant="outline" size="sm">
                  <Compass className="size-3.5" />
                  {t("brandDashboard.discoverCreators")}
                </Button>
              </Link>
            ) : undefined
          }
        />
      </div>
    </PageContainer>
  );
}
