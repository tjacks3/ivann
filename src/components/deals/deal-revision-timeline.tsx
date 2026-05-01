"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeliverablesList } from "@/components/packages/deliverables-list";
import { formatPrice } from "@/lib/currency";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowLeftRight,
  XCircle,
  Loader2,
} from "lucide-react";
import type { RevisionItem } from "@/app/(app)/deals/actions";

interface DealRevisionTimelineProps {
  revisions: RevisionItem[];
  isBrand?: boolean;
  isNegotiable?: boolean;
  /** The role of the user viewing (to determine who can accept) */
  userRole?: "brand" | "creator";
  onAccept?: () => void;
  onCounter?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  actionLoading?: boolean;
}

export function DealRevisionTimeline({
  revisions,
  isBrand,
  isNegotiable,
  userRole,
  onAccept,
  onCounter,
  onEdit,
  onCancel,
  actionLoading,
}: DealRevisionTimelineProps) {
  const { t, locale } = useTranslation();

  if (revisions.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{t("deal.revisions.title")}</h3>

      <div className="relative space-y-0">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

        {revisions.map((rev, i) => {
          const revIsBrand = rev.authorRole === "brand";
          const isLatest = i === revisions.length - 1;

          // The receiver (not the sender) can accept/counter on the latest revision
          const isReceiver = isLatest && userRole && rev.authorRole !== userRole;
          const isSender = isLatest && userRole && rev.authorRole === userRole;

          const hasDeliverables = !!rev.deliverables;
          const hasBudget = rev.budget != null;
          const hasTimeline = !!rev.timeline;
          const hasNotes = !!rev.notes;
          const hasChanges = hasDeliverables || hasBudget || hasTimeline || hasNotes;

          return (
            <div key={rev.id} className="relative flex gap-4 pb-4">
              {/* Timeline dot */}
              <div
                className={cn(
                  "relative z-10 mt-1.5 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  isLatest
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {rev.revisionNumber}
              </div>

              {/* Content */}
              <Card className={cn("flex-1", isLatest && "ring-1 ring-primary/20")}>
                <CardContent className="space-y-2 p-3">
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        revIsBrand
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-purple-500/10 text-purple-600",
                      )}
                    >
                      {revIsBrand ? t("deal.revisions.brandEdit") : t("deal.revisions.counterProposal")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      by: {rev.authorName} on{" "}
                      {new Date(rev.createdAt).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Changed fields only */}
                  {hasChanges && (
                    <div className="space-y-1.5 text-sm">
                      {hasDeliverables && (
                        <div className="mb-3">
                          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
                            <FileText className="size-3" />
                            {t("deal.deliverables")}
                          </div>
                          <DeliverablesList value={rev.deliverables!} />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        {hasBudget && (
                          <div>
                            <div className="flex items-center gap-0.5 text-xs font-medium uppercase text-muted-foreground">
                              <DollarSign className="-ml-0.5 size-3" />
                              {t("deal.budget")}
                            </div>
                            <p className="mt-1 text-sm font-medium">
                              {formatPrice(rev.budget!, rev.currency, locale)}
                            </p>
                          </div>
                        )}
                        {hasTimeline && (
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
                              <Clock className="size-3" />
                              {t("deal.timeline")}
                            </div>
                            <p className="mt-1 text-sm">{rev.timeline}</p>
                          </div>
                        )}
                      </div>
                      {hasNotes && (
                        <p className="text-xs italic text-muted-foreground">"{rev.notes}"</p>
                      )}
                    </div>
                  )}

                  {!hasChanges && (
                    <p className="text-xs text-muted-foreground">No changes from original proposal.</p>
                  )}

                  {/* Actions on the latest revision — only for the receiver */}
                  {isLatest && isNegotiable && isReceiver && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {onAccept && (
                        <Button
                          size="sm"
                          onClick={onAccept}
                          disabled={actionLoading}
                          className="cursor-pointer"
                        >
                          {actionLoading ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="size-3.5" />
                          )}
                          {t("deal.action.accept")}
                        </Button>
                      )}
                      {userRole === "creator" && onCounter && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onCounter}
                          disabled={actionLoading}
                          className="cursor-pointer"
                        >
                          <ArrowLeftRight className="size-3.5" />
                          {t("deal.counterProposal")}
                        </Button>
                      )}
                      {userRole === "brand" && onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onEdit}
                          disabled={actionLoading}
                          className="cursor-pointer"
                        >
                          <ArrowLeftRight className="size-3.5" />
                          {t("deal.editProposal")}
                        </Button>
                      )}
                      {onCancel && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={onCancel}
                          disabled={actionLoading}
                          className="cursor-pointer"
                        >
                          <XCircle className="size-3.5" />
                          {t("deal.action.cancel")}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Sender sees a waiting message */}
                  {isLatest && isNegotiable && isSender && (
                    <p className="pt-1 text-xs text-muted-foreground">
                      Waiting for the other party to respond...
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
