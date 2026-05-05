"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DealStatusBadge } from "./deal-status-badge";
import { WaitingOnBadge } from "@/components/deal-workspace/waiting-on-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { SectionHeader } from "@/components/shared/section-header";
import { useTranslation } from "@/i18n";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  Handshake,
  ArrowRight,
  Clock,
} from "lucide-react";
import type { DealListItem } from "@/app/(app)/deals/actions";
import type { CollabWithDetails } from "@/app/(app)/collaborations/actions";
import type { ReactNode } from "react";

// ─── Unified item type ──────────────────────────────────────────────────────

interface UnifiedDeal {
  id: string;
  kind: "deal" | "collab";
  title: string;
  otherPartyName: string | null;
  otherPartyUsername: string | null;
  otherPartyAvatar: string | null;
  status: string;
  budget: number | null;
  currency: string;
  timeline: string | null;
  updatedAt: Date;
  href: string;
  collaborationState: string | null;
  collabRequestId: string | null;
}

type StatusFilter = "all" | "active" | "pending" | "completed" | "cancelled";

const ACTIVE_STATUSES = new Set([
  "accepted",
  "in_progress",
  "delivered",
  "negotiating",
]);
const PENDING_STATUSES = new Set(["pending", "draft"]);
const COMPLETED_STATUSES = new Set(["completed"]);
const CANCELLED_STATUSES = new Set(["cancelled", "declined", "expired"]);

function matchesFilter(status: string, filter: StatusFilter): boolean {
  if (filter === "all") return true;
  if (filter === "active") return ACTIVE_STATUSES.has(status);
  if (filter === "pending") return PENDING_STATUSES.has(status);
  if (filter === "completed") return COMPLETED_STATUSES.has(status);
  if (filter === "cancelled") return CANCELLED_STATUSES.has(status);
  return true;
}

function getInitials(name: string | null): string {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// ─── Unify collabs + deals into one sorted list ─────────────────────────────

function unifyItems(
  deals: DealListItem[],
  collaborations: CollabWithDetails[],
  isBrand: boolean,
): UnifiedDeal[] {
  const fromDeals: UnifiedDeal[] = deals.map((d) => ({
    id: d.id,
    kind: "deal",
    title: d.title,
    otherPartyName: d.otherPartyName,
    otherPartyUsername: d.otherPartyUsername,
    otherPartyAvatar: d.otherPartyAvatar,
    status: d.status,
    budget: d.budget,
    currency: d.currency,
    timeline: d.timeline,
    updatedAt: d.updatedAt,
    href: d.collabRequestId && d.collaborationId
      ? `/deal-workspace/${d.collaborationId}`
      : `/deals/${d.id}`,
    collaborationState: d.collaborationState,
    collabRequestId: d.collabRequestId,
  }));

  const fromCollabs: UnifiedDeal[] = collaborations.map((c) => ({
    id: c.id,
    kind: "collab" as const,
    title: c.title,
    otherPartyName: isBrand ? c.creatorName : c.brandName,
    otherPartyUsername: isBrand ? c.creatorUsername : null,
    otherPartyAvatar: isBrand ? c.creatorAvatar : c.brandAvatar,
    status: c.status,
    budget: c.budget,
    currency: c.currency,
    timeline: c.deadline,
    updatedAt: c.respondedAt ?? c.createdAt,
    href: c.dealId ? `/deals/${c.dealId}` : "",
    collaborationState: null,
    collabRequestId: null,
  }));

  return [...fromDeals, ...fromCollabs].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
}

// ─── Status counts ──────────────────────────────────────────────────────────

function getCounts(items: UnifiedDeal[]) {
  let active = 0;
  let pending = 0;
  let completed = 0;
  let cancelled = 0;

  for (const item of items) {
    if (ACTIVE_STATUSES.has(item.status)) active++;
    else if (PENDING_STATUSES.has(item.status)) pending++;
    else if (COMPLETED_STATUSES.has(item.status)) completed++;
    else if (CANCELLED_STATUSES.has(item.status)) cancelled++;
  }

  return { all: items.length, active, pending, completed, cancelled };
}

// ─── Row component ─────────────────────────────────────────────────────────���

function DealRow({
  item,
  userRole,
}: {
  item: UnifiedDeal;
  userRole: "brand" | "creator";
}) {
  const { locale } = useTranslation();

  return (
    <Link href={item.href || "/deals"} className="block">
      <div className="group flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted/50">
        {/* Avatar */}
        <Avatar className="size-9 shrink-0 sm:size-10">
          {item.otherPartyAvatar && (
            <AvatarImage
              src={item.otherPartyAvatar}
              alt={item.otherPartyName || ""}
            />
          )}
          <AvatarFallback className="text-xs">
            {getInitials(item.otherPartyName)}
          </AvatarFallback>
        </Avatar>

        {/* Main info — title + other party + waiting badge */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">
            {item.title}
          </p>
          <div className="flex items-center gap-2">
            <p className="truncate text-xs text-muted-foreground">
              {item.otherPartyName}
              {item.otherPartyUsername && (
                <span className="text-muted-foreground/60">
                  {" "}
                  @{item.otherPartyUsername}
                </span>
              )}
            </p>
            {item.collaborationState && (
              <WaitingOnBadge
                state={item.collaborationState}
                userRole={userRole}
                className="hidden shrink-0 scale-90 origin-left sm:inline-flex"
              />
            )}
          </div>
        </div>

        {/* Budget — hidden on small screens */}
        <div className="hidden w-24 shrink-0 text-right sm:block">
          {item.budget ? (
            <span className="text-sm font-medium">
              {formatPrice(item.budget, item.currency, locale)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>

        {/* Status */}
        <div className="flex w-20 shrink-0 items-center justify-end sm:w-28">
          <DealStatusBadge status={item.status} />
        </div>

        {/* Updated time — hidden on small screens */}
        <div className="hidden w-16 shrink-0 text-right md:block">
          <span className="text-xs text-muted-foreground">
            {formatRelativeDate(item.updatedAt)}
          </span>
        </div>

      </div>
    </Link>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

interface DealsDashboardSectionProps {
  deals: DealListItem[];
  collaborations: CollabWithDetails[];
  isLoading: boolean;
  isBrand: boolean;
  emptyAction?: ReactNode;
  /** Max items to show before "View All" link. 0 = unlimited */
  limit?: number;
  /** Show the section header */
  showHeader?: boolean;
}

export function DealsDashboardSection({
  deals,
  collaborations,
  isLoading,
  isBrand,
  emptyAction,
  limit = 0,
  showHeader = true,
}: DealsDashboardSectionProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [hasInitFilter, setHasInitFilter] = useState(false);

  const allItems = useMemo(
    () => unifyItems(deals, collaborations, isBrand),
    [deals, collaborations, isBrand],
  );

  const counts = useMemo(() => getCounts(allItems), [allItems]);

  // Set smart default filter once data loads
  useEffect(() => {
    if (hasInitFilter || allItems.length === 0) return;
    const preferred = isBrand ? "active" : "pending";
    const preferredCount = isBrand ? counts.active : counts.pending;
    setFilter(preferredCount > 0 ? preferred : "all");
    setHasInitFilter(true);
  }, [allItems.length, counts, isBrand, hasInitFilter]);

  const filtered = useMemo(
    () => allItems.filter((item) => matchesFilter(item.status, filter)),
    [allItems, filter],
  );

  const displayed = limit > 0 ? filtered.slice(0, limit) : filtered;
  const hasMore = limit > 0 && filtered.length > limit;
  const userRole = isBrand ? "brand" : "creator";

  if (isLoading) {
    return (
      <div>
        {showHeader && <SectionHeader title={t("deal.dashboardTitle")} as="h2" />}
        <div className="mt-4">
          <LoadingState variant="skeleton" count={3} />
        </div>
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div>
        {showHeader && <SectionHeader title={t("deal.dashboardTitle")} as="h2" />}
        <div className="mt-4">
          <EmptyState
            icon={<Handshake className="size-6" />}
            title={isBrand ? t("deal.emptyBrandTitle") : t("deal.emptyCreatorTitle")}
            description={
              isBrand
                ? t("deal.emptyBrandDescription")
                : t("deal.emptyCreatorDescription")
            }
            action={emptyAction}
          />
        </div>
      </div>
    );
  }

  const filters: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: t("deal.filter.all"), count: counts.all },
    { key: "active", label: t("deal.filter.active"), count: counts.active },
    { key: "pending", label: t("deal.filter.pending"), count: counts.pending },
    {
      key: "completed",
      label: t("deal.filter.completed"),
      count: counts.completed,
    },
    {
      key: "cancelled",
      label: t("deal.filter.cancelled"),
      count: counts.cancelled,
    },
  ];

  return (
    <div>
      {showHeader && (
        <div className="flex items-center justify-between">
          <SectionHeader title={t("deal.dashboardTitle")} as="h2" />
          {limit > 0 && (
            <Link href="/deals">
              <Button variant="ghost" size="sm" className="text-xs">
                {t("deal.list.viewAll")}
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Status filter tabs */}
      <div className="mt-3 flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((f) =>
          f.count > 0 || f.key === "all" ? (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.key
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "tabular-nums",
                  filter === f.key
                    ? "text-background/70"
                    : "text-muted-foreground/60",
                )}
              >
                {f.count}
              </span>
            </button>
          ) : null,
        )}
      </div>

      {/* List */}
      <Card className="mt-3">
        <CardContent className="p-0">
          {/* Column headers — desktop only */}
          <div className="hidden items-center gap-4 border-b px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:flex">
            <div className="w-10 shrink-0" /> {/* avatar spacer */}
            <div className="min-w-0 flex-1">Deal</div>
            <div className="hidden w-24 shrink-0 text-right sm:block">
              {t("deal.budget")}
            </div>
            <div className="w-28 shrink-0 text-right">Status</div>
            <div className="hidden w-16 shrink-0 text-right md:block">
              {t("deal.list.updated")}
            </div>
          </div>

          {displayed.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Clock className="size-4" />
              {t("deal.list.noMatch")}
            </div>
          ) : (
            <div className="divide-y">
              {displayed.map((item) => (
                <DealRow
                  key={`${item.kind}-${item.id}`}
                  item={item}
                  userRole={userRole}
                />
              ))}
            </div>
          )}

          {/* View all link at bottom */}
          {hasMore && (
            <div className="border-t px-4 py-3 text-center">
              <Link href="/deals">
                <Button variant="ghost" size="sm" className="text-xs">
                  {t("deal.list.viewAll")} ({filtered.length})
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
