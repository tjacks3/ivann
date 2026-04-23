"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { DealStatusBadge } from "@/components/deals/deal-status-badge";
import { WaitingOnBadge } from "@/components/collaboration-workspace/waiting-on-badge";
import { RequestCard } from "@/components/collaborations/request-card";
import { useMyDeals } from "@/hooks/use-deals";
import { useCollaborations } from "@/hooks/use-collaborations";
import { useUser } from "@/hooks/use-user";
import { useTranslation } from "@/i18n";
import { formatPrice } from "@/lib/currency";
import { Handshake } from "lucide-react";

export default function DealsPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { deals, isLoading: dealsLoading } = useMyDeals();
  const { collaborations, isLoading: collabsLoading, refetch: refetchCollabs } = useCollaborations();
  const isBrand = user?.role === "brand";

  const isLoading = dealsLoading || collabsLoading;
  const hasContent = deals.length > 0 || collaborations.length > 0;

  return (
    <PageContainer>
      <SectionHeader
        title={t("deal.pageTitle")}
        description={t("deal.pageSubtitle")}
      />

      <div className="mt-8">
        {isLoading ? (
          <LoadingState variant="skeleton" count={4} />
        ) : !hasContent ? (
          <EmptyState
            icon={<Handshake className="size-6" />}
            title={isBrand ? t("deal.emptyBrandTitle") : t("deal.emptyCreatorTitle")}
            description={isBrand ? t("deal.emptyBrandDescription") : t("deal.emptyCreatorDescription")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {collaborations.map((collab) => (
              <RequestCard
                key={`collab-${collab.id}`}
                collab={collab}
                viewAs={isBrand ? "brand" : "creator"}
                onUpdated={refetchCollabs}
              />
            ))}
            {deals.map((deal) => (
              <Link
                key={`deal-${deal.id}`}
                href={
                  deal.collaborationId
                    ? `/collaboration-workspace/${deal.collaborationId}`
                    : `/deals/${deal.id}`
                }
              >
                <Card className="transition-all hover:shadow-md hover:scale-[1.01]">
                  <CardContent className="space-y-2 pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{deal.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {deal.otherPartyName}
                          {deal.otherPartyUsername && ` @${deal.otherPartyUsername}`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {deal.collaborationState && (
                          <WaitingOnBadge
                            state={deal.collaborationState}
                            userRole={isBrand ? "brand" : "creator"}
                          />
                        )}
                        <DealStatusBadge status={deal.status} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {deal.budget && (
                        <span>{formatPrice(deal.budget, deal.currency, "en")}</span>
                      )}
                      {deal.timeline && <span>{deal.timeline}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
