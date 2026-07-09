"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Calendar,
} from "lucide-react";

const DEAL_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending: "Pending",
  negotiating: "Negotiating",
  accepted: "Accepted",
  in_progress: "In Progress",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

const DEAL_STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  negotiating: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  accepted: "bg-primary/15 text-primary",
  in_progress: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  funding_pending: "Funding Pending",
  funded: "Funded",
  released: "Released",
  refunded: "Refunded",
};

interface CreatorDeal {
  campaignDealId: string;
  dealId: string;
  allocatedBudgetInCents: number;
  dueDate: string | null;
  deal: {
    id: string;
    title: string;
    status: string;
    creatorId: string;
    creator: {
      id: string;
      fullName: string | null;
      username: string | null;
      avatarUrl: string | null;
      categories: string[] | null;
      location: string | null;
    };
    collaboration: {
      id: string;
      state: string;
    } | null;
    payment: {
      id: string;
      status: string;
      amountInCents: number;
    } | null;
  };
}

interface CampaignCreatorsTableProps {
  creatorDeals: CreatorDeal[];
  remainingBudgetInCents: number;
  onAllocateBudget: (campaignDealId: string, amountInCents: number) => void;
  onUpdateDueDate: (campaignDealId: string, dueDate: string) => void;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function CampaignCreatorsTable({
  creatorDeals,
  remainingBudgetInCents,
  onAllocateBudget,
  onUpdateDueDate,
}: CampaignCreatorsTableProps) {
  const router = useRouter();

  if (creatorDeals.length === 0) {
    return (
      <div className="rounded-xl border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No creators have been added to this campaign yet.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Send offers from the match page to add creators.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      {/* Header */}
      <div className="border-b px-5 py-3">
        <h3 className="text-sm font-semibold">
          Campaign Creators ({creatorDeals.length})
        </h3>
      </div>

      {/* Column headers */}
      <div className="hidden items-center gap-4 border-b px-5 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:flex">
        <div className="w-10 shrink-0" />
        <div className="min-w-0 flex-1">Creator</div>
        <div className="w-28 shrink-0 text-right">Budget</div>
        <div className="w-28 shrink-0 text-center">Due Date</div>
        <div className="w-24 shrink-0 text-center">Status</div>
        <div className="w-24 shrink-0 text-center">Payment</div>
      </div>

      {/* Rows */}
      <div className="divide-y">
        {creatorDeals.map((cd) => {
          const { deal } = cd;
          const creator = deal.creator;
          const dealHref = `/deals/${deal.id}`;

          return (
            <div
              key={cd.campaignDealId}
              onClick={() => router.push(dealHref)}
              className="flex cursor-pointer items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/50"
            >
              {/* Avatar */}
              <Avatar className="size-10 shrink-0">
                {creator.avatarUrl ? (
                  <img
                    src={creator.avatarUrl}
                    alt={creator.fullName ?? ""}
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {(creator.fullName ?? "?")[0]}
                  </div>
                )}
              </Avatar>

              {/* Creator Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {creator.fullName ?? creator.username ?? "Creator"}
                </p>
                {creator.username && (
                  <p className="text-xs text-muted-foreground">
                    @{creator.username}
                  </p>
                )}
              </div>

              {/* Budget */}
              <div className="w-28 shrink-0">
                <p className="text-right text-sm font-medium">
                  {formatCents(cd.allocatedBudgetInCents)}
                </p>
              </div>

              {/* Due Date */}
              <div className="w-28 shrink-0 text-center">
                {cd.dueDate ? (
                  <span className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    {cd.dueDate}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>

              {/* Deal Status */}
              <div className="w-24 shrink-0 text-center">
                <Badge
                  className={`text-xs ${DEAL_STATUS_COLORS[deal.status] ?? "bg-muted text-muted-foreground"}`}
                >
                  {DEAL_STATUS_LABELS[deal.status] ?? deal.status}
                </Badge>
              </div>

              {/* Payment Status */}
              <div className="w-24 shrink-0 text-center">
                {deal.payment ? (
                  <Badge variant="outline" className="text-xs">
                    <DollarSign className="mr-0.5 size-3" />
                    {PAYMENT_STATUS_LABELS[deal.payment.status] ??
                      deal.payment.status}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
