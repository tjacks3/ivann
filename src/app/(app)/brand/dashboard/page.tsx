"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { LoadingState } from "@/components/shared/loading-state";
import { PaymentSummaryCard } from "@/components/deals/payment-summary-card";
import { DealsDashboardSection } from "@/components/deals/deals-dashboard-section";
import { useBrandProfile } from "@/hooks/use-brand-profile";
import { useMyDeals } from "@/hooks/use-deals";
import { useCollaborations } from "@/hooks/use-collaborations";
import { useTranslation } from "@/i18n";
import { getPaymentSummary, type PaymentSummary } from "@/app/(app)/deals/payment-actions";
import { getMyCampaigns, type CampaignListItem } from "@/app/(app)/brand/campaigns/actions";
import { Target, Users, DollarSign, ArrowRight, Plus } from "lucide-react";

export default function BrandDashboardPage() {
  const { t } = useTranslation();
  const { profile, isLoading } = useBrandProfile();
  const { deals, isLoading: dealsLoading } = useMyDeals();
  const { collaborations, isLoading: collabsLoading } = useCollaborations();
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [campaignsList, setCampaignsList] = useState<CampaignListItem[]>([]);

  useEffect(() => {
    getPaymentSummary().then(setPaymentSummary);
    getMyCampaigns().then((result) => {
      if (result.success) {
        setCampaignsList(result.campaigns.slice(0, 3));
      }
    });
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
      {/* Mini Profile Summary */}
      <div className="flex items-center gap-3">
        <Avatar className="size-10">
          {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.brandName || ""} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-base font-semibold leading-tight">{profile.brandName}</h1>
          <p className="text-xs text-muted-foreground">Brand</p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="mt-6">
        <PaymentSummaryCard
          summary={paymentSummary ?? { totalReleased: 0, totalFunded: 0, currency: "usd", recentTransactions: [] }}
          isBrand
        />
      </div>

      {/* Campaigns */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <SectionHeader title="Campaigns" as="h2" />
          <Link href="/brand/campaigns/new" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Plus className="size-3.5" />
            New Campaign
          </Link>
        </div>
        {campaignsList.length > 0 ? (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {campaignsList.map((campaign) => (
              <Link key={campaign.id} href={`/brand/campaigns/${campaign.id}`} className="group">
                <Card className="transition-colors hover:border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="truncate text-sm font-semibold group-hover:text-primary">{campaign.name}</h3>
                      <Badge className="shrink-0 text-xs capitalize">{campaign.status}</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="size-3" />{campaign.creatorCount}</span>
                      <span className="flex items-center gap-1"><DollarSign className="size-3" />${(campaign.totalBudgetInCents / 100).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {campaignsList.length >= 3 && (
              <Link href="/brand/campaigns" className="flex items-center justify-center gap-1 text-sm text-primary hover:underline">
                View all campaigns <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed p-6 text-center">
            <Target className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No campaigns yet</p>
            <Link href="/brand/campaigns/new" className={buttonVariants({ size: "sm", className: "mt-3" })}>
              Create your first campaign
            </Link>
          </div>
        )}
      </div>

      {/* Deals */}
      <div className="mt-6">
        <DealsDashboardSection
          deals={deals}
          collaborations={collaborations}
          isLoading={dealsLoading || collabsLoading}
          isBrand
          limit={8}
          emptyAction={
            <Link href="/discover" className={buttonVariants()}>
              {t("nav.discover")}
            </Link>
          }
        />
      </div>
    </PageContainer>
  );
}
