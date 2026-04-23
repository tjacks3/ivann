"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { DealStatusBadge } from "@/components/deals/deal-status-badge";
import { WaitingOnBadge } from "@/components/collaboration-workspace/waiting-on-badge";
import { PaymentSummaryCard } from "@/components/deals/payment-summary-card";
import { RequestCard } from "@/components/collaborations/request-card";
import { useBrandProfile } from "@/hooks/use-brand-profile";
import { useMyDeals } from "@/hooks/use-deals";
import { useCollaborations } from "@/hooks/use-collaborations";
import { useTranslation } from "@/i18n";
import { formatPrice } from "@/lib/currency";
import { getPaymentSummary, type PaymentSummary } from "@/app/(app)/deals/payment-actions";
import { Compass, Globe, Handshake, Zap, ClipboardList } from "lucide-react";

export default function BrandDashboardPage() {
  const { t } = useTranslation();
  const { profile, isLoading } = useBrandProfile();
  const { deals, isLoading: dealsLoading } = useMyDeals();
  const { collaborations, isLoading: collabsLoading, refetch: refetchCollabs } = useCollaborations();
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);

  useEffect(() => {
    getPaymentSummary().then(setPaymentSummary);
  }, []);

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (!profile) {
    return null;
  }

  const initials = (profile.brandName || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <PageContainer>
      <SectionHeader
        title={t("brandDashboard.title")}
        description={t("brandDashboard.subtitle")}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Brand Profile Card */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <Avatar className="size-16 text-lg">
                {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.brandName || ""} />}
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg font-semibold">{profile.brandName}</h2>
                {profile.industry && (
                  <p className="text-sm text-muted-foreground">{t(`onboarding.category.${profile.industry}`)}</p>
                )}
                {profile.bio && (
                  <p className="mt-2 line-clamp-2 max-w-md text-sm text-muted-foreground">{profile.bio}</p>
                )}
                {profile.companyWebsite && (
                  <a
                    href={profile.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Globe className="size-3.5" />
                    {profile.companyWebsite.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">{t("brandDashboard.quickActions")}</h3>

          <Card className="transition-colors hover:border-primary/30">
            <CardContent className="pt-4">
              <Link href="/brand/quick-collab" className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Zap className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("quickCollab.cta.title")}</p>
                  <p className="text-xs text-muted-foreground">{t("quickCollab.cta.hint")}</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-colors hover:border-primary/30">
            <CardContent className="pt-4">
              <Link href="/brand/quick-collab/tracking" className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ClipboardList className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("brandDashboard.trackOutreach")}</p>
                  <p className="text-xs text-muted-foreground">{t("brandDashboard.trackOutreachHint")}</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-colors hover:border-primary/30">
            <CardContent className="pt-4">
              <Link href="/discover" className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Compass className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("brandDashboard.discoverCreators")}</p>
                  <p className="text-xs text-muted-foreground">{t("brandDashboard.discoverCreatorsHint")}</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="mt-8">
        <PaymentSummaryCard
          summary={paymentSummary ?? { totalReleased: 0, totalFunded: 0, currency: "usd", recentTransactions: [] }}
          isBrand
        />
      </div>

      {/* Collaborations & Deals */}
      <div className="mt-12">
        <SectionHeader
          title={t("deal.dashboardTitle")}
          as="h2"
        />
        <div className="mt-4">
          {(dealsLoading || collabsLoading) ? (
            <LoadingState variant="skeleton" count={3} />
          ) : (deals.length === 0 && collaborations.length === 0) ? (
            <EmptyState
              icon={<Handshake className="size-6" />}
              title={t("deal.emptyBrandTitle")}
              description={t("deal.emptyBrandDescription")}
              action={
                <Link href="/discover" className={buttonVariants()}>
                  {t("nav.discover")}
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {collaborations.map((collab) => (
                <RequestCard
                  key={`collab-${collab.id}`}
                  collab={collab}
                  viewAs="brand"
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
                              userRole="brand"
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
      </div>
    </PageContainer>
  );
}
