"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import type { PaymentSummary } from "@/app/(app)/deals/payment-actions";

const STATUS_COLORS: Record<string, string> = {
  unpaid: "bg-muted text-muted-foreground",
  funding_pending: "bg-amber-500/10 text-amber-600",
  funded: "bg-primary/10 text-primary",
  released: "bg-primary/10 text-primary",
  refunded: "bg-amber-500/10 text-amber-600",
};

const HIDDEN_VALUE = "••••••";

interface PaymentSummaryCardProps {
  summary: PaymentSummary;
  isBrand: boolean;
}

export function PaymentSummaryCard({ summary, isBrand }: PaymentSummaryCardProps) {
  const { t, locale } = useTranslation();
  const [visible, setVisible] = useState(true);

  const fmt = (cents: number) =>
    visible ? formatPrice(cents, summary.currency, locale) : HIDDEN_VALUE;

  return (
    <Card>
      <CardContent className="space-y-5 pt-5">
        {/* Totals */}
        <div className="flex items-start gap-6">
          {/* Primary total */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {isBrand ? t("deal.payment.summary.totalSpent") : t("deal.payment.summary.totalEarned")}
              </p>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setVisible(!visible)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </Button>
            </div>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {fmt(summary.totalReleased + summary.totalFunded)}
            </p>
          </div>

          {/* Breakdown */}
          {summary.totalFunded > 0 && (
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {isBrand
                  ? t("deal.payment.summary.fundsHeld")
                  : t("deal.payment.summary.pendingFunds")}
              </p>
              <p className="mt-1 text-lg font-semibold text-primary">
                {fmt(summary.totalFunded)}
              </p>
            </div>
          )}
          {summary.totalReleased > 0 && (
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {t("deal.payment.summary.released")}
              </p>
              <p className="mt-1 text-lg font-semibold text-muted-foreground">
                {fmt(summary.totalReleased)}
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
                      {visible ? formatPrice(tx.amountInCents, tx.currency, locale) : HIDDEN_VALUE}
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
