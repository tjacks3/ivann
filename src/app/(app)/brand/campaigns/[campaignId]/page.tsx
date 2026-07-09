"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { CampaignOverview } from "@/components/campaign/campaign-overview";
import { CampaignBudgetCard } from "@/components/campaign/campaign-budget-card";
import { CampaignCreatorsTable } from "@/components/campaign/campaign-creators-table";
import { SelectedCreatorsSection } from "@/components/campaign/selected-creators-section";
import { SendDealSheet } from "@/components/campaign/send-deal-sheet";
import {
  getCampaign,
  allocateBudget,
  updateCreatorDueDate,
  updateCampaignStatus,
  type CampaignWithDetails,
} from "@/app/(app)/brand/campaigns/actions";
import {
  ArrowLeft,
  UserPlus,
  Play,
  Pause,
  CheckCircle,
  Target,
} from "lucide-react";

export default function CampaignWorkspacePage() {
  const params = useParams<{ campaignId: string }>();
  const campaignId = params.campaignId;

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<CampaignWithDetails | null>(null);
  const [sendDealOpen, setSendDealOpen] = useState(false);
  const [sendDealCreators, setSendDealCreators] = useState<
    { creatorId: string; fullName: string | null; username: string | null; avatarUrl: string | null }[]
  >([]);

  const loadCampaign = useCallback(async () => {
    const result = await getCampaign(campaignId);
    if (result.success) {
      setCampaign(result.campaign);
    }
    setLoading(false);
  }, [campaignId]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  const handleAllocateBudget = async (
    campaignDealId: string,
    amountInCents: number,
  ) => {
    const result = await allocateBudget(campaignId, campaignDealId, amountInCents);
    if (result.success) {
      await loadCampaign();
    }
  };

  const handleUpdateDueDate = async (
    campaignDealId: string,
    dueDate: string,
  ) => {
    await updateCreatorDueDate(campaignDealId, dueDate);
    await loadCampaign();
  };

  const handleCreateOffers = (creatorIds: string[]) => {
    if (!campaign) return;
    const creatorsForSheet = creatorIds
      .map((cid) => {
        const match = campaign.campaignMatches.find((m) => m.creatorId === cid);
        if (!match) return null;
        return {
          creatorId: match.creatorId,
          fullName: match.creator?.fullName ?? null,
          username: match.creator?.username ?? null,
          avatarUrl: match.creator?.avatarUrl ?? null,
        };
      })
      .filter(Boolean) as { creatorId: string; fullName: string | null; username: string | null; avatarUrl: string | null }[];

    setSendDealCreators(creatorsForSheet);
    setSendDealOpen(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    await updateCampaignStatus(campaignId, newStatus as any);
    await loadCampaign();
  };

  if (loading || !campaign) {
    return (
      <PageContainer>
        <LoadingState variant="spinner" />
      </PageContainer>
    );
  }

  // Transform campaign deals for table
  const creatorDeals = campaign.campaignDeals.map((cd) => ({
    campaignDealId: cd.id,
    dealId: cd.dealId,
    allocatedBudgetInCents: cd.allocatedBudgetInCents,
    dueDate: cd.dueDate,
    deal: {
      id: cd.deal.id,
      title: cd.deal.title,
      status: cd.deal.status,
      creatorId: cd.deal.creatorId,
      creator: cd.deal.creator,
      collaboration: cd.deal.collaboration,
      payment: (cd.deal as any).payment ?? null,
    },
  }));

  // Count added matches (not yet sent offers)
  const addedMatches = campaign.campaignMatches.filter(
    (m) => m.status === "added",
  );
  const addedNotYetSent = addedMatches.filter(
    (m) => !campaign.campaignDeals.some((cd) => cd.deal.creatorId === m.creatorId),
  );

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/brand/campaigns"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="size-3.5" />
            Campaigns
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/brand/campaigns/${campaignId}/match`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <UserPlus className="size-3.5" />
            Find Creators
          </Link>
          {campaign.status === "recruiting" && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("active")}
              className="cursor-pointer"
            >
              <Play className="size-3.5" />
              Activate Campaign
            </Button>
          )}
          {campaign.status === "active" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("paused")}
                className="cursor-pointer"
              >
                <Pause className="size-3.5" />
                Pause
              </Button>
              <Button
                size="sm"
                onClick={() => handleStatusChange("completed")}
                className="cursor-pointer"
              >
                <CheckCircle className="size-3.5" />
                Complete
              </Button>
            </>
          )}
          {campaign.status === "paused" && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("active")}
              className="cursor-pointer"
            >
              <Play className="size-3.5" />
              Resume
            </Button>
          )}
        </div>
      </div>

      {/* Campaign Overview */}
      <CampaignOverview
        name={campaign.name}
        description={campaign.description}
        goal={campaign.goal}
        campaignType={campaign.campaignType}
        status={campaign.status}
        startDate={campaign.startDate}
        endDate={campaign.endDate}
        platforms={campaign.platforms ?? []}
      />

      {/* Budget + Reach Row */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <CampaignBudgetCard
          totalBudgetInCents={campaign.totalBudgetInCents}
          allocatedBudgetInCents={campaign.allocatedBudgetInCents}
          remainingBudgetInCents={campaign.remainingBudgetInCents}
          creatorCount={campaign.campaignDeals.length}
        />

        {/* Reach Projection */}
        <div className="rounded-xl border p-5">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Reach Projection</h3>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-lg font-bold">
                {campaign.reachGoal
                  ? campaign.reachGoal.toLocaleString()
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Goal</p>
            </div>
            <div>
              <p className="text-lg font-bold text-primary">
                {campaign.campaignMatches
                  .filter(
                    (m) =>
                      m.status === "added" ||
                      campaign.campaignDeals.some(
                        (cd) => cd.deal.creatorId === m.creatorId,
                      ),
                  )
                  .reduce((sum, m) => sum + (m.estimatedReach ?? 0), 0)
                  .toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Projected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Creators — Send Offers */}
      {addedNotYetSent.length > 0 && (
        <div className="mt-6">
          <SelectedCreatorsSection
            creators={addedNotYetSent.map((m) => ({
              id: m.id,
              creatorId: m.creatorId,
              fullName: m.creator?.fullName ?? null,
              username: m.creator?.username ?? null,
              avatarUrl: m.creator?.avatarUrl ?? null,
            }))}
            onCreateOffers={handleCreateOffers}
          />
        </div>
      )}

      {/* Send Deal Sheet */}
      <SendDealSheet
        open={sendDealOpen}
        onOpenChange={setSendDealOpen}
        campaignId={campaignId}
        creators={sendDealCreators}
        remainingBudgetInCents={campaign.remainingBudgetInCents}
        onDealSent={loadCampaign}
        onComplete={async () => {
          await loadCampaign();
          setSendDealOpen(false);
        }}
      />

      {/* Creators Table */}
      <div className="mt-6">
        <CampaignCreatorsTable
          creatorDeals={creatorDeals}
          remainingBudgetInCents={campaign.remainingBudgetInCents}
          onAllocateBudget={handleAllocateBudget}
          onUpdateDueDate={handleUpdateDueDate}
        />
      </div>
    </PageContainer>
  );
}
