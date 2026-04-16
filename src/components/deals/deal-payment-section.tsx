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

  const showPaymentSection =
    dealStatus === "accepted" ||
    dealStatus === "in_progress" ||
    dealStatus === "delivered" ||
    dealStatus === "completed" ||
    dealStatus === "cancelled";

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
        status === "funded" && "border-green-500/30 bg-green-500/5",
        status === "released" && "border-green-500/30",
        status === "refunded" && "border-amber-500/30 bg-amber-500/5",
      )}
    >
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          {/* Status icon */}
          {status === "unpaid" && (
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <DollarSign className="size-5 text-muted-foreground" />
            </div>
          )}
          {status === "funding_pending" && (
            <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
              <Clock className="size-5 text-amber-600" />
            </div>
          )}
          {status === "funded" && (
            <div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
              <ShieldCheck className="size-5 text-green-600" />
            </div>
          )}
          {status === "released" && (
            <div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="size-5 text-green-600" />
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
              <>
                <p className="text-sm font-medium">
                  {isBrand
                    ? t("deal.payment.unpaidBrand")
                    : t("deal.payment.unpaidCreator")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(amount, currency, locale)}
                </p>
              </>
            )}
            {status === "funding_pending" && (
              <p className="text-sm font-medium text-amber-600">
                {t("deal.payment.processing")}
              </p>
            )}
            {status === "funded" && (
              <>
                <p className="text-sm font-medium text-green-700">
                  {t("deal.payment.secured")} — {formatPrice(amount, currency, locale)}
                </p>
                <p className="text-xs text-green-600/80">
                  {isBrand
                    ? t("deal.payment.heldBrand")
                    : t("deal.payment.heldCreator")}
                </p>
              </>
            )}
            {status === "released" && (
              <p className="text-sm font-medium text-green-700">
                {isBrand
                  ? t("deal.payment.releasedBrand")
                  : t("deal.payment.releasedCreator")}{" "}
                — {formatPrice(amount, currency, locale)}
              </p>
            )}
            {status === "refunded" && (
              <p className="text-sm font-medium text-amber-700">
                {t("deal.payment.refunded")} — {formatPrice(amount, currency, locale)}
              </p>
            )}
          </div>
        </div>

        {/* Fund button (brand only, unpaid only) */}
        {isBrand && status === "unpaid" && amount > 0 && (
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
      </CardContent>
    </Card>
  );
}
