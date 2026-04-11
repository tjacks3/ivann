"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackageTypeBadge } from "./package-type-badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Pencil, Trash2, Loader2, Clock, RotateCcw } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { deletePackage } from "@/app/(app)/packages/actions";
import { useTranslation } from "@/i18n";
import type { Package } from "@/db/schema/packages";

const statusStyles: Record<string, string> = {
  draft: "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  active: "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
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
    <Card>
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{pkg.title}</h3>
            {pkg.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {pkg.description}
              </p>
            )}
          </div>
          <p className="text-lg font-bold shrink-0">
            {formatPrice(pkg.priceInCents, pkg.currency, locale)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PackageTypeBadge type={pkg.type} />
          <span
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${statusStyles[pkg.status] ?? ""}`}
          >
            {t(`packages.status.${pkg.status}`)}
          </span>
          {pkg.deliveryDays && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {pkg.deliveryDays}d
                </TooltipTrigger>
                <TooltipContent>{t("packages.tooltip.delivery", { days: pkg.deliveryDays })}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {pkg.revisions > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-1 text-xs text-muted-foreground">
                  <RotateCcw className="size-3" />
                  {pkg.revisions} {pkg.revisions === 1 ? "revision" : "revisions"}
                </TooltipTrigger>
                <TooltipContent>{t("packages.tooltip.revisions", { count: pkg.revisions })}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(pkg)}
          >
            <Pencil className="size-3" />
            {t("packages.edit")}
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
