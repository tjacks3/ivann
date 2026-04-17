"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PackageTypeBadge } from "./package-type-badge";
import { DeliverablesList } from "./deliverables-list";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Clock, RotateCcw, Handshake } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { useTranslation } from "@/i18n";
import type { Package } from "@/db/schema/packages";

interface PackagePublicCardProps {
  pkg: Package;
  onSelect?: () => void;
}

export function PackagePublicCard({ pkg, onSelect }: PackagePublicCardProps) {
  const { t, locale } = useTranslation();


  return (
    <Card className="transition-all hover:shadow-md hover:scale-[1.01]">
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{pkg.title}</h3>
          <p className="text-lg font-bold shrink-0">
            {formatPrice(pkg.priceInCents, pkg.currency, locale)}
          </p>
        </div>

        {pkg.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {pkg.description}
          </p>
        )}

        {pkg.deliverables && (
          <DeliverablesList value={pkg.deliverables} limit={3} />
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <PackageTypeBadge type={pkg.type} />
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
                    {pkg.revisions}
                  </TooltipTrigger>
                  <TooltipContent>{t("packages.tooltip.revisions", { count: pkg.revisions })}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {onSelect && (
            <button
              type="button"
              onClick={onSelect}
              className="inline-flex items-center gap-1 rounded-full border border-input bg-background px-3 py-1 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Handshake className="size-3" />
              {t("collab.select")}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
