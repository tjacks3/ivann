"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PackageTypeBadge } from "./package-type-badge";
import { Clock, RotateCcw } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { useTranslation } from "@/i18n";
import type { Package } from "@/db/schema/packages";

interface PackagePublicCardProps {
  pkg: Package;
}

export function PackagePublicCard({ pkg }: PackagePublicCardProps) {
  const { locale } = useTranslation();

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

        <div className="flex flex-wrap items-center gap-2">
          <PackageTypeBadge type={pkg.type} />
          {pkg.deliveryDays && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {pkg.deliveryDays} days
            </span>
          )}
          {pkg.revisions > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <RotateCcw className="size-3" />
              {pkg.revisions} {pkg.revisions === 1 ? "revision" : "revisions"}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
