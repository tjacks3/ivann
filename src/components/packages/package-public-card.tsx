"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackageTypeBadge } from "./package-type-badge";
import { DeliverablesList } from "./deliverables-list";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Clock, RotateCcw, Handshake, MapPin, Repeat, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { useTranslation } from "@/i18n";
import type { Package } from "@/db/schema/packages";

function getBestForLabel(pkg: Package, t: (key: string) => string): string | null {
  const desc = (pkg.description ?? "").toLowerCase();
  const title = (pkg.title ?? "").toLowerCase();

  if (title.includes("local") || title.includes("boost") || desc.includes("local") || desc.includes("foot traffic")) {
    return t("packages.preview.bestFor.local");
  }
  if (title.includes("ongoing") || title.includes("partnership") || desc.includes("recurring") || desc.includes("continuous")) {
    return t("packages.preview.bestFor.ongoing");
  }
  if (pkg.type === "bundle") {
    return t("packages.preview.bestFor.bundle");
  }
  if (pkg.priceInCents <= 10000) {
    return t("packages.preview.bestFor.starter");
  }
  return null;
}

function getValueMessage(pkg: Package, t: (key: string) => string): string | null {
  if (pkg.priceInCents <= 10000) {
    return t("packages.preview.value.budget");
  }
  if (pkg.type === "bundle" && pkg.priceInCents <= 30000) {
    return t("packages.preview.value.bundleSavings");
  }
  return null;
}

interface PackagePublicCardProps {
  pkg: Package;
  creatorName?: string;
  onSelect?: () => void;
}

export function PackagePublicCard({ pkg, creatorName, onSelect }: PackagePublicCardProps) {
  const { t, locale } = useTranslation();

  const bestFor = getBestForLabel(pkg, t);
  const valueMessage = getValueMessage(pkg, t);
  const isLocal = (pkg.title ?? "").toLowerCase().includes("local") || (pkg.description ?? "").toLowerCase().includes("local");
  const isOngoing = (pkg.title ?? "").toLowerCase().includes("ongoing") || (pkg.title ?? "").toLowerCase().includes("partnership");

  return (
    <Card className="flex flex-col transition-all hover:shadow-md hover:scale-[1.01]">
      <CardContent className="flex flex-1 flex-col space-y-4 pt-5">
        {/* Type badge — top left */}
        <div className="flex justify-start">
          <PackageTypeBadge type={pkg.type} className="px-2 py-0.5 text-[10px]" />
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold">{pkg.title}</h3>

        {/* Contextual badges */}
        {(isLocal || isOngoing) && (
          <div className="flex flex-wrap items-center gap-2">
            {isLocal && (
              <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700">
                <MapPin className="size-3" />
                {t("packages.preview.localTag")}
              </span>
            )}
            {isOngoing && (
              <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <Repeat className="size-3" />
                {t("packages.preview.ongoingTag")}
              </span>
            )}
          </div>
        )}

        {/* Best for label */}
        {bestFor && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Sparkles className="size-3" />
            {bestFor}
          </div>
        )}

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
            <DeliverablesList value={pkg.deliverables} />
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

        {/* Value messaging */}
        {valueMessage && (
          <p className="rounded-md bg-primary/5 px-3 py-1.5 text-xs text-primary">
            {valueMessage}
          </p>
        )}

        {/* Spacer to push CTA to bottom */}
        <div className="flex-1" />

        {/* CTA */}
        {onSelect && (
          <Button
            onClick={onSelect}
            className="w-full cursor-pointer"
          >
            <Handshake className="size-3.5" />
            {t("packages.preview.startDeal")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
