"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";
import { useTranslation } from "@/i18n";
import type { CollaborationData } from "@/app/(app)/deal-workspace/actions";

function getInitials(name: string | null): string {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const STATE_STYLES: Record<string, string> = {
  awaiting_brand_brief: "bg-amber-500/10 text-amber-600",
  awaiting_creator_confirmation: "bg-amber-500/10 text-amber-600",
  revision_requested: "bg-red-500/10 text-red-600",
  in_progress: "bg-blue-500/10 text-blue-600",
  submitted: "bg-purple-500/10 text-purple-600",
  completed: "bg-primary/10 text-primary",
};

const STATE_LABELS: Record<string, string> = {
  awaiting_brand_brief: "Awaiting Brief",
  awaiting_creator_confirmation: "Awaiting Confirmation",
  revision_requested: "Revision Requested",
  in_progress: "In Progress",
  submitted: "Submitted",
  completed: "Completed",
};

interface CollaborationSummaryProps {
  collaboration: CollaborationData;
}

export function CollaborationSummary({
  collaboration,
}: CollaborationSummaryProps) {
  const { locale } = useTranslation();

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        {/* Title + Status */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{collaboration.dealTitle}</h2>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              STATE_STYLES[collaboration.state] ?? STATE_STYLES.in_progress,
            )}
          >
            {STATE_LABELS[collaboration.state] ?? collaboration.state}
          </span>
        </div>

        {/* Parties + Budget/Timeline bar */}
        <div className="flex items-center justify-between">
          {/* Parties */}
          <div className="flex items-center gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <Avatar className="size-10">
                {collaboration.brandAvatar && (
                  <AvatarImage
                    src={collaboration.brandAvatar}
                    alt={collaboration.brandName || ""}
                  />
                )}
                <AvatarFallback className="text-xs">
                  {getInitials(collaboration.brandName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Brand</p>
                <p className="truncate text-sm font-medium">
                  {collaboration.brandName}
                </p>
              </div>
            </div>

            <div className="h-10 w-px bg-border" />

            {/* Creator */}
            <div className="flex items-center gap-2.5">
              <Avatar className="size-10">
                {collaboration.creatorAvatar && (
                  <AvatarImage
                    src={collaboration.creatorAvatar}
                    alt={collaboration.creatorName || ""}
                  />
                )}
                <AvatarFallback className="text-xs">
                  {getInitials(collaboration.creatorName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Creator</p>
                <p className="truncate text-sm font-medium">
                  {collaboration.creatorName}
                </p>
                {collaboration.creatorUsername && (
                  <p className="text-xs text-muted-foreground">
                    @{collaboration.creatorUsername}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Budget + Timeline — right-aligned */}
          <div className="flex items-center gap-6">
            {collaboration.budgetAmount && (
              <div className="text-right">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Budget
                </p>
                <p className="text-sm font-semibold">
                  {formatPrice(
                    collaboration.budgetAmount,
                    collaboration.dealCurrency,
                    locale,
                  )}
                </p>
              </div>
            )}
            {collaboration.dueDate && (
              <div className="text-right">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Timeline
                </p>
                <p className="text-sm font-semibold">
                  {new Date(collaboration.dueDate).toLocaleDateString(locale, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
