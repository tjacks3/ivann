"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";
import { useTranslation } from "@/i18n";
import { Target, Package, Calendar, DollarSign } from "lucide-react";
import type { CollaborationData } from "@/app/(app)/deal-workspace/actions";
import type { BriefValues } from "@/lib/validations/deal-workspace";

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

interface AgreementSnapshotCardProps {
  collaboration: CollaborationData;
}

export function AgreementSnapshotCard({
  collaboration,
}: AgreementSnapshotCardProps) {
  const { locale } = useTranslation();
  const brief = collaboration.briefData as BriefValues | null;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Agreement
          </h3>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              STATE_STYLES[collaboration.state] ?? STATE_STYLES.in_progress,
            )}
          >
            {STATE_LABELS[collaboration.state] ?? collaboration.state}
          </span>
        </div>

        <div className="space-y-2.5">
          {/* Campaign Goal */}
          {brief?.campaignGoal && (
            <div className="flex items-start gap-2">
              <Target className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Goal</p>
                <p className="line-clamp-2 text-sm">{brief.campaignGoal}</p>
              </div>
            </div>
          )}

          {/* Deliverable */}
          {collaboration.deliverableType && (
            <div className="flex items-start gap-2">
              <Package className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Deliverable</p>
                <p className="text-sm">{collaboration.deliverableType}</p>
              </div>
            </div>
          )}

          {/* Due Date */}
          {collaboration.dueDate && (
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Due Date</p>
                <p className="text-sm">
                  {new Date(collaboration.dueDate).toLocaleDateString(locale, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Budget */}
          {collaboration.budgetAmount && (
            <div className="flex items-start gap-2">
              <DollarSign className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Budget</p>
                <p className="text-sm font-medium">
                  {formatPrice(
                    collaboration.budgetAmount,
                    collaboration.dealCurrency,
                    locale,
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
