"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar, Target } from "lucide-react";

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

interface CampaignOverviewProps {
  name: string;
  description: string | null;
  goal: string | null;
  campaignType: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  platforms: string[];
}

export function CampaignOverview({
  name,
  description,
  goal,
  campaignType,
  status,
  startDate,
  endDate,
  platforms,
}: CampaignOverviewProps) {
  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{name}</h1>
          {goal && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Target className="size-3.5" />
              {goal}
            </p>
          )}
        </div>
        <Badge className={STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"}>
          {STATUS_LABELS[status] ?? status}
        </Badge>
      </div>

      {description && (
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <Badge variant="outline">{CAMPAIGN_TYPE_LABELS[campaignType] ?? campaignType}</Badge>
        {platforms.map((p) => (
          <Badge key={p} variant="secondary" className="capitalize">
            {p}
          </Badge>
        ))}
        {(startDate || endDate) && (
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {startDate ?? "—"} → {endDate ?? "Ongoing"}
          </span>
        )}
      </div>
    </div>
  );
}
