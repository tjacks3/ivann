"use client";

import { Progress } from "@/components/ui/progress";
import { DollarSign, AlertTriangle } from "lucide-react";

interface CampaignBudgetCardProps {
  totalBudgetInCents: number;
  allocatedBudgetInCents: number;
  remainingBudgetInCents: number;
  creatorCount: number;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function CampaignBudgetCard({
  totalBudgetInCents,
  allocatedBudgetInCents,
  remainingBudgetInCents,
  creatorCount,
}: CampaignBudgetCardProps) {
  const usedPercent =
    totalBudgetInCents > 0
      ? Math.min(100, (allocatedBudgetInCents / totalBudgetInCents) * 100)
      : 0;
  const isOverBudget = remainingBudgetInCents < 0;

  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center gap-2">
        <DollarSign className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">Campaign Budget</h3>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-bold">
            {formatCents(totalBudgetInCents)}
          </p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div>
          <p className="text-lg font-bold">
            {formatCents(allocatedBudgetInCents)}
          </p>
          <p className="text-xs text-muted-foreground">Allocated</p>
        </div>
        <div>
          <p
            className={`text-lg font-bold ${isOverBudget ? "text-destructive" : "text-primary"}`}
          >
            {formatCents(remainingBudgetInCents)}
          </p>
          <p className="text-xs text-muted-foreground">Remaining</p>
        </div>
      </div>

      <div className="mt-4">
        <Progress value={usedPercent} className="h-2" />
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {usedPercent.toFixed(0)}% allocated across {creatorCount} creator
            {creatorCount !== 1 ? "s" : ""}
          </span>
          {isOverBudget && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="size-3" />
              Over budget
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
