"use client";

import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-yellow-500/10 text-yellow-600",
  negotiating: "bg-amber-500/10 text-amber-600",
  accepted: "bg-primary/10 text-primary",
  in_progress: "bg-blue-500/10 text-blue-600",
  delivered: "bg-purple-500/10 text-purple-600",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-red-500/10 text-red-600",
};

interface DealStatusBadgeProps {
  status: string;
}

export function DealStatusBadge({ status }: DealStatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status] ?? STATUS_STYLES.draft,
      )}
    >
      {t(`deal.status.${status}`)}
    </span>
  );
}
