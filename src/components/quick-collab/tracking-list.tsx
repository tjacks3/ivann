"use client";

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { Send, MessageSquare } from "lucide-react";
import type { TrackingItem } from "@/app/(app)/brand/quick-collab/actions";

const STATUS_FILTERS = [
  "all",
  "draft",
  "sent",
  "accepted",
  "declined",
] as const;

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-500/10 text-blue-600",
  viewed: "bg-amber-500/10 text-amber-600",
  replied: "bg-purple-500/10 text-purple-600",
  accepted: "bg-green-500/10 text-green-600",
  declined: "bg-red-500/10 text-red-600",
};

interface TrackingListProps {
  outreaches: TrackingItem[];
  allOutreaches: TrackingItem[];
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
}

export function TrackingList({
  outreaches,
  allOutreaches,
  statusFilter,
  onStatusFilterChange,
}: TrackingListProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const isActive =
            filter === "all" ? statusFilter === null : statusFilter === filter;
          const count =
            filter === "all"
              ? allOutreaches.length
              : allOutreaches.filter((o) => o.effectiveStatus === filter).length;

          return (
            <button
              key={filter}
              type="button"
              onClick={() =>
                onStatusFilterChange(filter === "all" ? null : filter)
              }
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input text-muted-foreground hover:border-primary/30",
              )}
            >
              {t(`quickCollab.tracking.status.${filter}`)} ({count})
            </button>
          );
        })}
      </div>

      {/* Outreach list */}
      {outreaches.length === 0 ? (
        <EmptyState
          icon={<Send className="size-6" />}
          title={t("quickCollab.tracking.emptyTitle")}
          description={t("quickCollab.tracking.emptyDescription")}
        />
      ) : (
        <div className="space-y-3">
          {outreaches.map((item) => {
            const initials = (item.creatorName || "?")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card key={item.outreachId}>
                <CardContent className="flex items-center gap-4 py-3">
                  <Avatar className="size-10">
                    {item.creatorAvatar && (
                      <AvatarImage
                        src={item.creatorAvatar}
                        alt={item.creatorName || ""}
                      />
                    )}
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {item.creatorName}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          STATUS_COLORS[item.effectiveStatus] ??
                            STATUS_COLORS.draft,
                        )}
                      >
                        {t(
                          `quickCollab.tracking.status.${item.effectiveStatus}`,
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      @{item.creatorUsername} &middot;{" "}
                      {t(`quickCollab.collabTypeOption.${item.collabType}`)} &middot;{" "}
                      {item.businessName}
                    </p>
                    {item.sentAt && (
                      <p className="text-xs text-muted-foreground">
                        {t("quickCollab.tracking.sentOn")}{" "}
                        {new Date(item.sentAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {item.effectiveStatus === "accepted" && (
                    <Link
                      href="/messages"
                      className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      <MessageSquare className="size-3" />
                      {t("quickCollab.tracking.goToMessages")}
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
