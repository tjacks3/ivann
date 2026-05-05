"use client";

import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

export type DealSource = "profile" | "quickCollab" | "custom" | "campaign";

const SOURCE_STYLES: Record<DealSource, string> = {
  profile: "bg-blue-500/10 text-blue-600",
  quickCollab: "bg-violet-500/10 text-violet-600",
  custom: "bg-muted text-muted-foreground",
  campaign: "bg-emerald-500/10 text-emerald-600",
};

interface DealSourceBadgeProps {
  source: DealSource;
  className?: string;
}

export function DealSourceBadge({ source, className }: DealSourceBadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-medium",
        SOURCE_STYLES[source],
        className,
      )}
    >
      {t(`deal.source.${source}`)}
    </span>
  );
}
