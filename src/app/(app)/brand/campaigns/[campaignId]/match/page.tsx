"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { CampaignMatchCard } from "@/components/campaign/campaign-match-card";
import {
  matchCreatorsForCampaign,
  getCampaign,
  updateCampaignMatchStatus,
  addCreatorToCampaign,
} from "@/app/(app)/brand/campaigns/actions";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Users,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CampaignMatchPage() {
  const params = useParams<{ campaignId: string }>();
  const router = useRouter();
  const campaignId = params.campaignId;

  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [totalBudgetInCents, setTotalBudgetInCents] = useState(0);
  const [allocatedBudgetInCents, setAllocatedBudgetInCents] = useState(0);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [totalFound, setTotalFound] = useState(0);

  type MatchItem = {
    id: string;
    matchScore: number;
    fitLabel: string;
    fitReasons: string[];
    estimatedReach: number | null;
    estimatedPriceRange: string | null;
    audienceAgeFit: boolean | null;
    locationFit: boolean | null;
    platformFit: boolean | null;
    status: string;
    source: string;
    creator: {
      id: string;
      fullName: string | null;
      username: string | null;
      avatarUrl: string | null;
      categories: string[] | null;
      location: string | null;
    };
  };

  const loadData = useCallback(async () => {
    const result = await getCampaign(campaignId);
    if (result.success) {
      setCampaignName(result.campaign.name);
      setTotalBudgetInCents(result.campaign.totalBudgetInCents);
      setAllocatedBudgetInCents(result.campaign.allocatedBudgetInCents);
      const existingMatches = result.campaign.campaignMatches.map((m) => ({
        id: m.id,
        matchScore: m.matchScore,
        fitLabel: m.fitLabel,
        fitReasons: m.fitReasons ?? [],
        estimatedReach: m.estimatedReach,
        estimatedPriceRange: m.estimatedPriceRange,
        audienceAgeFit: m.audienceAgeFit,
        locationFit: m.locationFit,
        platformFit: m.platformFit,
        status: m.status,
        source: m.source,
        creator: {
          id: m.creator.id,
          fullName: m.creator.fullName,
          username: m.creator.username,
          avatarUrl: m.creator.avatarUrl,
          categories: m.creator.categories,
          location: m.creator.location,
        },
      }));

      if (existingMatches.length > 0) {
        setMatches(existingMatches);
        setTotalFound(existingMatches.length);
        setLoading(false);
        return;
      }
    }

    // No existing matches — run matching
    await runMatching();
  }, [campaignId]);

  const runMatching = async () => {
    setMatching(true);
    const result = await matchCreatorsForCampaign(campaignId);
    if (result.success) {
      setMatches(
        result.matches.map((m: any) => ({
          id: m.id,
          matchScore: m.matchScore,
          fitLabel: m.fitLabel,
          fitReasons: m.fitReasons ?? [],
          estimatedReach: m.estimatedReach,
          estimatedPriceRange: m.estimatedPriceRange,
          audienceAgeFit: m.audienceAgeFit,
          locationFit: m.locationFit,
          platformFit: m.platformFit,
          status: m.status,
          source: m.source,
          creator: {
            id: m.creator.id,
            fullName: m.creator.fullName,
            username: m.creator.username,
            avatarUrl: m.creator.avatarUrl,
            categories: m.creator.categories,
            location: m.creator.location,
          },
        })),
      );
      setTotalFound(result.totalFound);
    }
    setMatching(false);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status: "added" } : m)),
    );
    await updateCampaignMatchStatus(matchId, "added");
  };

  const handleSkip = async (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status: "skipped" } : m)),
    );
    await updateCampaignMatchStatus(matchId, "skipped");
  };

  const addedCount = matches.filter(
    (m) => m.status === "added" || m.status === "selected",
  ).length;

  const handleContinue = () => {
    router.push(`/brand/campaigns/${campaignId}`);
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState variant="spinner" />
      </PageContainer>
    );
  }

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
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-medium">{campaignName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={runMatching}
            disabled={matching}
            className="cursor-pointer"
          >
            <RefreshCw
              className={cn("size-3.5", matching && "animate-spin")}
            />
            Re-match
          </Button>
          <Button
            size="sm"
            onClick={handleContinue}
            disabled={addedCount === 0}
            className="cursor-pointer"
          >
            Continue to Campaign
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Budget + Summary */}
      <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <span className="text-sm font-medium">
              {totalFound} creator{totalFound !== 1 ? "s" : ""} matched
            </span>
            {addedCount > 0 && (
              <span className="text-sm text-primary">
                &middot; {addedCount} added to campaign
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="size-3.5" />
              Total Budget:{" "}
              <span className="font-semibold text-foreground">
                ${(totalBudgetInCents / 100).toLocaleString()}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              Allocated:{" "}
              <span className="font-semibold text-foreground">
                ${(allocatedBudgetInCents / 100).toLocaleString()}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              Remaining:{" "}
              <span className="font-semibold text-primary">
                ${((totalBudgetInCents - allocatedBudgetInCents) / 100).toLocaleString()}
              </span>
            </span>
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Review matched creators below. Add the ones you want to work with,
          then continue to your campaign workspace.
        </p>
      </div>

      {/* Match Grid */}
      {matches.length === 0 ? (
        <EmptyState
          icon={<Search className="size-5" />}
          title="No matches found"
          description="Try adjusting your campaign criteria or browse creators manually."
          action={
            <Link href="/discover" className={buttonVariants({ size: "sm" })}>
              Browse Creators
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <CampaignMatchCard
              key={match.id}
              creator={match.creator}
              matchScore={match.matchScore}
              fitLabel={match.fitLabel}
              fitReasons={match.fitReasons}
              estimatedReach={match.estimatedReach}
              estimatedPriceRange={match.estimatedPriceRange}
              audienceAgeFit={match.audienceAgeFit}
              locationFit={match.locationFit}
              platformFit={match.platformFit}
              status={match.status}
              source={match.source}
              onAdd={() => handleAdd(match.id)}
              onSkip={() => handleSkip(match.id)}
              onViewProfile={() =>
                window.open(
                  `/creator/${match.creator.username ?? match.creator.id}`,
                  "_blank",
                )
              }
            />
          ))}
        </div>
      )}

      {/* Manual discovery link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Don&rsquo;t see the right fit?
        </p>
        <Link
          href="/discover"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
          })}
        >
          <Search className="size-3.5" />
          Browse All Creators
        </Link>
      </div>
    </PageContainer>
  );
}

