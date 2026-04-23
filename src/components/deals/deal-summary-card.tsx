"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DealStatusBadge } from "./deal-status-badge";
import { DeliverablesList } from "@/components/packages/deliverables-list";
import { formatPrice } from "@/lib/currency";
import { useTranslation } from "@/i18n";
import { Pencil, DollarSign, Clock, FileText, ArrowLeftRight } from "lucide-react";
import type { DealWithParties } from "@/app/(app)/deals/actions";

function getInitials(name: string | null): string {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface DealSummaryCardProps {
  deal: DealWithParties;
  isBrand: boolean;
  isNegotiable: boolean;
  hasRevisions?: boolean;
  onEdit: () => void;
  onCounter: () => void;
}

export function DealSummaryCard({
  deal,
  isBrand,
  isNegotiable,
  hasRevisions,
  onEdit,
  onCounter,
}: DealSummaryCardProps) {
  const { t, locale } = useTranslation();

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        {/* Title + Status */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{deal.title}</h2>
          <DealStatusBadge status={deal.status} />
        </div>

        {/* Parties */}
        <div className="flex items-center gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <Avatar className="size-10">
                {deal.brandAvatar && (
                  <AvatarImage src={deal.brandAvatar} alt={deal.brandName || ""} />
                )}
                <AvatarFallback className="text-xs">
                  {getInitials(deal.brandName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{t("deal.brand")}</p>
                <p className="truncate text-sm font-medium">{deal.brandName}</p>
              </div>
            </div>

            <div className="h-10 w-px bg-border" />

            {/* Creator */}
            <div className="flex items-center gap-2.5">
              <Avatar className="size-10">
                {deal.creatorAvatar && (
                  <AvatarImage src={deal.creatorAvatar} alt={deal.creatorName || ""} />
                )}
                <AvatarFallback className="text-xs">
                  {getInitials(deal.creatorName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{t("deal.creator")}</p>
                <p className="truncate text-sm font-medium">{deal.creatorName}</p>
                {deal.creatorUsername && (
                  <p className="text-xs text-muted-foreground">@{deal.creatorUsername}</p>
                )}
              </div>
            </div>
        </div>

        {/* Description */}
        {deal.notes && (
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              {t("deal.description")}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
              {deal.notes}
            </p>
          </div>
        )}

        {/* Deal details */}
        <div className="rounded-lg border p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Deliverables */}
            <div className="sm:col-span-3">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
                <FileText className="size-3" />
                {t("deal.deliverables")}
              </div>
              <div className="mt-2">
                {deal.deliverables ? (
                  <DeliverablesList value={deal.deliverables} />
                ) : (
                  <p className="text-sm text-muted-foreground">{t("deal.notSpecified")}</p>
                )}
              </div>
            </div>

            {/* Budget */}
            <div>
              <div className="flex items-center gap-0.5 text-xs font-medium uppercase text-muted-foreground">
                <DollarSign className="-ml-0.5 size-3" />
                {t("deal.budget")}
              </div>
              <p className="mt-1 text-sm font-medium">
                {deal.budget
                  ? formatPrice(deal.budget, deal.currency, locale)
                  : t("deal.notSpecified")}
              </p>
            </div>

            {/* Timeline */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
                <Clock className="size-3" />
                {t("deal.timeline")}
              </div>
              <p className="mt-1 text-sm">
                {deal.timeline || t("deal.notSpecified")}
              </p>
            </div>

            {/* Action button — hidden when revisions exist (moves to revision timeline) */}
            {isNegotiable && !hasRevisions && (
              <div className="flex items-end sm:justify-end">
                {isBrand ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    className="cursor-pointer"
                  >
                    <Pencil className="size-3.5" />
                    {t("deal.editProposal")}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCounter}
                    className="cursor-pointer"
                  >
                    <ArrowLeftRight className="size-3.5" />
                    {t("deal.counterProposal")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
