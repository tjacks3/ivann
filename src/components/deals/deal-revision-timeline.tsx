"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/currency";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { RichTextDisplay } from "@/components/ui/rich-text-display";
import { FileText, DollarSign, Clock } from "lucide-react";
import type { RevisionItem } from "@/app/(app)/deals/actions";

interface DealRevisionTimelineProps {
  revisions: RevisionItem[];
}

export function DealRevisionTimeline({ revisions }: DealRevisionTimelineProps) {
  const { t, locale } = useTranslation();

  if (revisions.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{t("deal.revisions.title")}</h3>

      <div className="relative space-y-0">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

        {revisions.map((rev, i) => {
          const isBrand = rev.authorRole === "brand";
          const isLatest = i === revisions.length - 1;

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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          isBrand
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-purple-500/10 text-purple-600",
                        )}
                      >
                        {isBrand ? t("deal.revisions.brandEdit") : t("deal.revisions.counterProposal")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {rev.authorName}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(rev.createdAt).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Changes */}
                  <div className="space-y-1.5 text-sm">
                    {rev.deliverables && (
                      <div className="flex items-start gap-1.5">
                        <FileText className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                        <div className="line-clamp-2 text-muted-foreground">
                          <RichTextDisplay content={rev.deliverables} />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      {rev.budget != null && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="size-3 text-muted-foreground" />
                          <span className="font-medium">{formatPrice(rev.budget, rev.currency, locale)}</span>
                        </div>
                      )}
                      {rev.timeline && (
                        <div className="flex items-center gap-1">
                          <Clock className="size-3 text-muted-foreground" />
                          <span>{rev.timeline}</span>
                        </div>
                      )}
                    </div>
                    {rev.notes && (
                      <p className="text-xs italic text-muted-foreground">"{rev.notes}"</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
