"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/currency";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { DollarSign, TrendingUp, Clock } from "lucide-react";
import type { PaymentSummary } from "@/app/(app)/deals/payment-actions";

const STATUS_COLORS: Record<string, string> = {
  unpaid: "bg-muted text-muted-foreground",
  funding_pending: "bg-amber-500/10 text-amber-600",
  funded: "bg-blue-500/10 text-blue-600",
  released: "bg-green-500/10 text-green-600",
  refunded: "bg-amber-500/10 text-amber-600",
};

interface PaymentSummaryCardProps {
  summary: PaymentSummary;
  isBrand: boolean;
}

export function PaymentSummaryCard({ summary, isBrand }: PaymentSummaryCardProps) {
  const { t, locale } = useTranslation();

  return (
    <Card>
      <CardContent className="space-y-5 pt-5">
        {/* Totals */}
        <div className="flex items-start gap-6">
          {/* Primary total */}
          <div className="flex-1">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              {isBrand ? t("deal.payment.summary.totalSpent") : t("deal.payment.summary.totalEarned")}
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {formatPrice(summary.totalReleased, summary.currency, locale)}
            </p>
          </div>

          {/* Secondary total */}
          {summary.totalFunded > 0 && (
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {isBrand
                  ? t("deal.payment.summary.fundsHeld")
                  : t("deal.payment.summary.pendingFunds")}
              </p>
              <p className="mt-1 text-lg font-semibold text-muted-foreground">
                {formatPrice(summary.totalFunded, summary.currency, locale)}
              </p>
            </div>
          )}
        </div>

        {/* Recent transactions */}
        {summary.recentTransactions.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              {t("deal.payment.summary.recentTransactions")}
            </p>
            <div className="mt-2 divide-y">
              {summary.recentTransactions.map((tx) => (
                <Link
                  key={tx.dealId}
                  href={`/deals/${tx.dealId}`}
                  className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-muted/50 -mx-2 px-2 rounded"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{tx.dealTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.otherPartyName} &middot;{" "}
                      {new Date(tx.date).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatPrice(tx.amountInCents, tx.currency, locale)}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        STATUS_COLORS[tx.status] ?? STATUS_COLORS.unpaid,
                      )}
                    >
                      {t(`deal.payment.status.${tx.status}`)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
