"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ProfileStatusBadge } from "@/components/profile/profile-status-badge";
import { DealStatusBadge } from "@/components/deals/deal-status-badge";
import { RequestCard } from "@/components/collaborations/request-card";
import { PaymentSummaryCard } from "@/components/deals/payment-summary-card";
import { useCreatorProfile } from "@/hooks/use-creator-profile";
import { useMyDeals } from "@/hooks/use-deals";
import { useCollaborations } from "@/hooks/use-collaborations";
import { useTranslation } from "@/i18n";
import { formatPrice } from "@/lib/currency";
import { getPaymentSummary, type PaymentSummary } from "@/app/(app)/deals/payment-actions";
import { Pencil, Eye, Package, Handshake } from "lucide-react";
import type { ProfileStatus } from "@/types";

function getProfileCompletion(profile: {
  fullName?: string | null;
  username?: string | null;
  bio?: string | null;
  categories?: string[];
  location?: string | null;
  avatarUrl?: string | null;
  website?: string | null;
}): number {
  const fields = [
    !!profile.fullName,
    !!profile.username,
    !!profile.bio,
    (profile.categories?.length ?? 0) > 0,
    !!profile.location,
    !!profile.avatarUrl,
    !!profile.website,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export default function CreatorDashboardPage() {
  const { t } = useTranslation();
  const { profile, isLoading } = useCreatorProfile();
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

  const completion = getProfileCompletion(profile);
  const initials = (profile.fullName || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <PageContainer>
      <SectionHeader
        title={t("creatorDashboard.title")}
        description={t("creatorDashboard.subtitle")}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <Avatar className="size-16 text-lg">
                {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.fullName || ""} />}
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h2 className="text-lg font-semibold">{profile.fullName}</h2>
                  <ProfileStatusBadge status={profile.profileStatus as ProfileStatus} />
                </div>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                {profile.bio && (
                  <p className="mt-2 line-clamp-2 max-w-md text-sm text-muted-foreground">{profile.bio}</p>
                )}

                <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                  <Link href="/creator/profile/edit" className={buttonVariants({ size: "sm" })}>
                    <Pencil className="size-3.5" />
                    {t("creatorDashboard.editProfile")}
                  </Link>
                  <Link href="/creator/profile" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    <Eye className="size-3.5" />
                    {t("creatorDashboard.viewProfile")}
                  </Link>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            {completion < 100 && (
              <div className="mt-6 space-y-2 rounded-lg border border-dashed border-border p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t("creatorDashboard.profileCompletion")}</span>
                  <span className="text-muted-foreground">{completion}%</span>
                </div>
                <Progress value={completion} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {t("creatorDashboard.profileCompletionHint")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">{t("creatorDashboard.quickActions")}</h3>

          <Card className="transition-colors hover:border-primary/30">
            <CardContent className="pt-4">
              <Link href="/creator/profile/edit" className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Pencil className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("creatorDashboard.editProfile")}</p>
                  <p className="text-xs text-muted-foreground">{t("profile.edit.subtitle")}</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-colors hover:border-primary/30">
            <CardContent className="pt-4">
              <Link href="/packages" className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Package className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("creatorDashboard.managePackages")}</p>
                  <p className="text-xs text-muted-foreground">{t("creatorDashboard.managePackagesHint")}</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Summary */}
      {paymentSummary && (paymentSummary.totalReleased > 0 || paymentSummary.totalFunded > 0 || paymentSummary.recentTransactions.length > 0) && (
        <div className="mt-8">
          <PaymentSummaryCard summary={paymentSummary} isBrand={false} />
        </div>
      )}

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
              title={t("deal.emptyCreatorTitle")}
              description={t("deal.emptyCreatorDescription")}
            />
          ) : (
            <div className="space-y-8">
              {collaborations.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                    {t("collab.sectionTitle")} ({collaborations.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {collaborations.map((collab) => (
                      <RequestCard
                        key={collab.id}
                        collab={collab}
                        viewAs="creator"
                        onUpdated={refetchCollabs}
                      />
                    ))}
                  </div>
                </div>
              )}
              {deals.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                    {t("deal.sectionTitle")} ({deals.length})
                  </h3>
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
