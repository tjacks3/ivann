"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { DealStatusBadge } from "@/components/deals/deal-status-badge";
import { useMyDeals } from "@/hooks/use-deals";
import { useUser } from "@/hooks/use-user";
import { useTranslation } from "@/i18n";
import { formatPrice } from "@/lib/currency";
import { Handshake } from "lucide-react";

export default function DealsPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { deals, isLoading } = useMyDeals();
  const isBrand = user?.role === "brand";

  return (
    <PageContainer>
      <SectionHeader
        title={t("deal.pageTitle")}
        description={t("deal.pageSubtitle")}
      />

      <div className="mt-8">
        {isLoading ? (
          <LoadingState variant="skeleton" count={4} />
        ) : deals.length === 0 ? (
          <EmptyState
            icon={<Handshake className="size-6" />}
            title={isBrand ? t("deal.emptyBrandTitle") : t("deal.emptyCreatorTitle")}
            description={isBrand ? t("deal.emptyBrandDescription") : t("deal.emptyCreatorDescription")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {deals.map((deal) => (
              <Link key={deal.id} href={`/deals/${deal.id}`}>
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
                      <DealStatusBadge status={deal.status} />
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
