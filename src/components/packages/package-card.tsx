"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackageTypeBadge } from "./package-type-badge";
import { DeliverablesList } from "./deliverables-list";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Pencil, Trash2, Loader2, Clock, RotateCcw, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { deletePackage } from "@/app/(app)/packages/actions";
import { useTranslation } from "@/i18n";
import type { Package } from "@/db/schema/packages";

const statusStyles: Record<string, string> = {
  draft: "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  active: "border-primary bg-primary/10 text-primary",
  archived: "border-gray-500 bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

interface PackageCardProps {
  pkg: Package;
  onEdit: (pkg: Package) => void;
  onDeleted: () => void;
}

export function PackageCard({ pkg, onEdit, onDeleted }: PackageCardProps) {
  const { t, locale } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await deletePackage(pkg.id);
    onDeleted();
  };

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col space-y-4 pt-5">
        {/* Type badge + status badge */}
        <div className="flex items-center justify-between">
          <PackageTypeBadge type={pkg.type} className="px-2 py-0.5 text-[10px]" />
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyles[pkg.status] ?? ""}`}
          >
            {t(`packages.status.${pkg.status}`)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold">{pkg.title}</h3>

        {/* Description */}
        {pkg.description && (
          <p className="text-sm text-muted-foreground">{pkg.description}</p>
        )}

        {/* Deliverables */}
        {pkg.deliverables && (
          <div className="border-b border-dotted border-border pb-4">
            <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">
              {t("packages.preview.whatsIncluded")}
            </p>
            <DeliverablesList value={pkg.deliverables} limit={3} />
          </div>
        )}

        {/* Price */}
        <p className="text-xl font-bold">
          {formatPrice(pkg.priceInCents, pkg.currency, locale)}
        </p>

        {/* Meta: delivery + revisions */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {pkg.deliveryDays && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {pkg.deliveryDays} {t("packages.preview.days")}
                </TooltipTrigger>
                <TooltipContent>{t("packages.tooltip.delivery", { days: pkg.deliveryDays })}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {pkg.revisions > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-1">
                  <RotateCcw className="size-3" />
                  {pkg.revisions} {pkg.revisions === 1 ? t("packages.preview.revision") : t("packages.preview.revisions")}
                </TooltipTrigger>
                <TooltipContent>{t("packages.tooltip.revisions", { count: pkg.revisions })}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Draft nudge */}
        {pkg.status === "draft" && (
          <div className="flex items-center gap-2 rounded-md bg-amber-500/5 px-2.5 py-1.5">
            <AlertCircle className="size-3 shrink-0 text-amber-600" />
            <p className="text-[11px] text-amber-700">
              {t("packages.card.draftNudge")}
            </p>
          </div>
        )}

        {/* Spacer to push actions to bottom */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={pkg.status === "draft" ? "default" : "outline"}
            className="flex-1 cursor-pointer"
            onClick={() => onEdit(pkg)}
          >
            <Pencil className="size-3" />
            {pkg.status === "draft" ? t("packages.card.finishAndPublish") : t("packages.edit")}
          </Button>
          {confirming ? (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="destructive"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting && <Loader2 className="size-3 animate-spin" />}
                {t("packages.confirmDelete")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirming(false)}
              >
                {t("packages.cancelDelete")}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="size-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
