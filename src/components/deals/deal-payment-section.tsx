"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  Shield,
  ShieldCheck,
  CheckCircle,
  ArrowDownCircle,
  Loader2,
  DollarSign,
  Clock,
} from "lucide-react";
import type { DealPaymentInfo } from "@/app/(app)/deals/payment-actions";

interface DealPaymentSectionProps {
  payment: DealPaymentInfo | null;
  dealBudget: number | null;
  dealCurrency: string;
  isBrand: boolean;
  dealStatus: string;
  onFund: () => Promise<void>;
}

export function DealPaymentSection({
  payment,
  dealBudget,
  dealCurrency,
  isBrand,
  dealStatus,
  onFund,
}: DealPaymentSectionProps) {
  const { t, locale } = useTranslation();
  const [funding, setFunding] = useState(false);

  const isTerminal = dealStatus === "cancelled" || dealStatus === "completed";
  const showPaymentSection =
    dealStatus === "accepted" ||
    dealStatus === "in_progress" ||
    dealStatus === "delivered" ||
    dealStatus === "completed" ||
    (dealStatus === "cancelled" && payment?.status && payment.status !== "unpaid");

  if (!showPaymentSection) return null;

  const status = payment?.status ?? "unpaid";
  const amount = payment?.amountInCents ?? dealBudget ?? 0;
  const currency = payment?.currency ?? dealCurrency;

  const handleFund = async () => {
    setFunding(true);
    await onFund();
    setFunding(false);
  };

  return (
    <Card
      className={cn(
        "overflow-hidden",
        status === "unpaid" && "border-muted",
        status === "funding_pending" && "border-amber-500/30",
        status === "funded" && "border-primary/30",
        status === "released" && "border-primary/30",
        status === "refunded" && "border-amber-500/30",
      )}
    >
      <CardContent className="flex items-stretch gap-0 p-0">
        {/* Status details — left panel */}
        <div className="flex flex-1 items-center justify-between gap-4 px-5 py-5">
          <div className="flex items-center gap-3">
            {/* Status icon */}
            {status === "unpaid" && (
              <div className="flex size-10 items-center justify-center rounded-full bg-primary">
                <DollarSign className="size-5 text-white" />
              </div>
            )}
            {status === "funding_pending" && (
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
                <Clock className="size-5 text-amber-600" />
              </div>
            )}
            {status === "funded" && (
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="size-5 fill-primary text-primary-foreground" />
              </div>
            )}
            {status === "released" && (
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="size-5 fill-primary text-primary-foreground" />
              </div>
            )}
            {status === "refunded" && (
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
                <ArrowDownCircle className="size-5 text-amber-600" />
              </div>
            )}

            {/* Status text */}
            <div>
              {status === "unpaid" && (
                <p className="text-sm font-medium">
                  {isBrand
                    ? t("deal.payment.unpaidBrand")
                    : t("deal.payment.unpaidCreator")}
                </p>
              )}
              {status === "funding_pending" && (
                <p className="text-sm font-medium text-amber-600">
                  {t("deal.payment.processing")}
                </p>
              )}
              {status === "funded" && (
                <>
                  <p className="text-sm font-medium text-primary">
                    {t("deal.payment.secured")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isBrand
                      ? t("deal.payment.heldBrand")
                      : t("deal.payment.heldCreator")}
                  </p>
                </>
              )}
              {status === "released" && (
                <p className="text-sm font-medium text-primary">
                  {isBrand
                    ? t("deal.payment.releasedBrand")
                    : t("deal.payment.releasedCreator")}
                </p>
              )}
              {status === "refunded" && (
                <p className="text-sm font-medium text-amber-700">
                  {t("deal.payment.refunded")}
                </p>
              )}
            </div>
          </div>

          {/* Fund button (brand only, unpaid only, not cancelled) */}
          {isBrand && status === "unpaid" && !isTerminal && amount > 0 && (
            <Button
              onClick={handleFund}
              disabled={funding}
              className="cursor-pointer"
            >
              {funding ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Shield className="size-3.5" />
              )}
              {t("deal.payment.fundDeal")}
            </Button>
          )}
        </div>

        {/* Amount — right panel with status-colored background */}
        <div
          className={cn(
            "flex shrink-0 flex-col items-center justify-center px-6 py-5",
            status === "unpaid" && "bg-muted",
            status === "funding_pending" && "bg-amber-500/10",
            status === "funded" && "bg-primary/10",
            status === "released" && "bg-primary/10",
            status === "refunded" && "bg-amber-500/10",
          )}
        >
          <p
            className={cn(
              "text-2xl font-bold",
              status === "unpaid" && "text-foreground",
              status === "funding_pending" && "text-amber-700",
              status === "funded" && "text-primary",
              status === "released" && "text-primary",
              status === "refunded" && "text-amber-700",
            )}
          >
            {formatPrice(amount, currency, locale)}
          </p>
          <p
            className={cn(
              "mt-0.5 text-xs font-medium uppercase tracking-wide",
              status === "unpaid" && "text-muted-foreground",
              status === "funding_pending" && "text-amber-600",
              status === "funded" && "text-primary/80",
              status === "released" && "text-primary/80",
              status === "refunded" && "text-amber-600",
            )}
          >
            {status === "unpaid" && t("deal.payment.statusUnpaid")}
            {status === "funding_pending" && t("deal.payment.statusPending")}
            {status === "funded" && t("deal.payment.statusSecured")}
            {status === "released" && t("deal.payment.statusReleased")}
            {status === "refunded" && t("deal.payment.statusRefunded")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
