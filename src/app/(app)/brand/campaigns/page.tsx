"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getMyCampaigns,
  type CampaignListItem,
} from "@/app/(app)/brand/campaigns/actions";
import {
  Plus,
  Target,
  Users,
  DollarSign,
  Calendar,
  ArrowRight,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  matching: "Matching",
  recruiting: "Recruiting",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  matching: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  recruiting: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  active: "bg-primary/15 text-primary",
  paused: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  archived: "bg-muted text-muted-foreground",
};

const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  product_promotion: "Product Promotion",
  brand_awareness: "Brand Awareness",
  restaurant_promotion: "Restaurant Promotion",
  event_marketing: "Event Marketing",
  ugc: "UGC",
  giveaway: "Giveaway",
  launch: "Launch",
  ongoing_partnership: "Ongoing Partnership",
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function CampaignsListPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);

  useEffect(() => {
    getMyCampaigns().then((result) => {
      if (result.success) {
        setCampaigns(result.campaigns);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <LoadingState variant="spinner" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Campaigns"
          description="Create and manage your influencer marketing campaigns."
        />
        <Link
          href="/brand/campaigns/new"
          className={buttonVariants({ size: "sm" })}
        >
          <Plus className="size-3.5" />
          New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Target className="size-5" />}
            title="No campaigns yet"
            description="Create your first campaign to start matching with creators."
            action={
              <Link href="/brand/campaigns/new" className={buttonVariants({ size: "sm" })}>
                Create Campaign
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/brand/campaigns/${campaign.id}`}
              className="group"
            >
              <Card className="transition-colors hover:border-primary/30">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold group-hover:text-primary">
                        {campaign.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="mt-1 text-xs capitalize"
                      >
                        {CAMPAIGN_TYPE_LABELS[campaign.campaignType] ??
                          campaign.campaignType}
                      </Badge>
                    </div>
                    <Badge
                      className={`shrink-0 text-xs ${STATUS_COLORS[campaign.status] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {STATUS_LABELS[campaign.status] ?? campaign.status}
                    </Badge>
                  </div>

                  {campaign.goal && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      {campaign.goal}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="size-3" />
                      {campaign.creatorCount} creator
                      {campaign.creatorCount !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="size-3" />
                      {formatCents(campaign.totalBudgetInCents)}
                    </span>
                    {(campaign.startDate || campaign.endDate) && (
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {campaign.startDate ?? "—"} →{" "}
                        {campaign.endDate ?? "Ongoing"}
                      </span>
                    )}
                  </div>

                  {campaign.allocatedBudgetInCents > 0 && (
                    <div className="mt-3">
                      <div className="h-1.5 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(100, (campaign.allocatedBudgetInCents / campaign.totalBudgetInCents) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatCents(campaign.allocatedBudgetInCents)} of{" "}
                        {formatCents(campaign.totalBudgetInCents)} allocated
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-end">
                    <span className="flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Open <ArrowRight className="size-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
