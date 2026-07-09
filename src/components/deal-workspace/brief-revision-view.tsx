"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BriefValues } from "@/lib/validations/deal-workspace";
import { FileText, AlertCircle, Pencil, CheckCircle2, XCircle, Clock } from "lucide-react";

const BRIEF_FIELDS: { key: keyof BriefValues; label: string }[] = [
  { key: "campaignGoal", label: "Campaign Goal" },
  { key: "productOrService", label: "Product / Service" },
  { key: "requiredMentions", label: "Required Mentions" },
  { key: "tagsHashtags", label: "Tags / Hashtags" },
  { key: "location", label: "Location" },
  { key: "postingWindowStart", label: "Posting Window Start" },
  { key: "postingWindowEnd", label: "Posting Window End" },
  { key: "specialInstructions", label: "Special Instructions" },
  { key: "restrictions", label: "Restrictions" },
];

interface BriefRevisionViewProps {
  briefData: BriefValues;
  revisionMessage: string | null;
  revisionRequestedAt?: Date | null;
  isBrand: boolean;
  onUpdateBrief?: () => void;
  onAcceptUpdates?: () => void;
  onCancel?: () => void;
}

export function BriefRevisionView({
  briefData,
  revisionMessage,
  revisionRequestedAt,
  isBrand,
  onUpdateBrief,
  onAcceptUpdates,
  onCancel,
}: BriefRevisionViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="size-4" />
          Campaign Brief
          <Badge
            variant="outline"
            className="ml-auto border-amber-500/30 bg-amber-500/10 text-amber-600"
          >
            <AlertCircle className="mr-1 size-3" />
            Changes Requested
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Negotiation state message */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {isBrand
              ? "The Creator requested changes. Review the message below and update the brief or accept as-is."
              : "You requested changes to this brief. Waiting for the Brand to update."}
          </p>
        </div>

        {/* Creator's revision message */}
        {revisionMessage && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Requested Changes
              </p>
              {revisionRequestedAt && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {new Date(revisionRequestedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(revisionRequestedAt).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            <div className="rounded-lg border border-dashed bg-muted/30 p-3">
              <p className="whitespace-pre-wrap text-sm">{revisionMessage}</p>
            </div>
          </div>
        )}

        {/* Original brief - always visible */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Current Brief
          </p>
          <div className="rounded-xl bg-muted/30 p-4">
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {BRIEF_FIELDS.map(({ key, label }) => {
                const value = briefData[key];
                if (!value) return null;
                return (
                  <div key={key} className="space-y-1 p-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {label}
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-foreground">
                      {value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Brand actions */}
        {isBrand && (
          <div className="flex flex-wrap gap-2">
            {onUpdateBrief && (
              <Button
                size="sm"
                onClick={onUpdateBrief}
                className="cursor-pointer"
              >
                <Pencil className="size-3.5" />
                Update Brief
              </Button>
            )}
            {onAcceptUpdates && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAcceptUpdates}
                className="cursor-pointer"
              >
                <CheckCircle2 className="size-3.5" />
                Keep Current Brief
              </Button>
            )}
            {onCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onCancel}
                className="cursor-pointer"
              >
                <XCircle className="size-3.5" />
                Cancel Deal
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
