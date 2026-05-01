"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Lock,
  Info,
} from "lucide-react";
import { initFunding, confirmFunding } from "@/app/(app)/deals/payment-actions";
import type { CollabPaymentData } from "@/app/(app)/collaboration-workspace/actions";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  unpaid: {
    label: "Awaiting Funding",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    textColor: "text-foreground",
  },
  funding_pending: {
    label: "Funding in Progress",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-700",
  },
  funded: {
    label: "Payment Secured",
    color: "text-primary",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
  },
  released: {
    label: "Payment Released",
    color: "text-primary",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
  },
  refunded: {
    label: "Payment Refunded",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-700",
  },
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  unpaid: <DollarSign className="size-4 text-muted-foreground" />,
  funding_pending: <Clock className="size-4 text-amber-600" />,
  funded: <ShieldCheck className="size-4 text-primary" />,
  released: <CheckCircle className="size-4 text-primary" />,
  refunded: <ArrowDownCircle className="size-4 text-amber-600" />,
};

interface CollaborationPaymentCardProps {
  payment: CollabPaymentData | null;
  dealBudget: number | null;
  dealCurrency: string;
  isBrand: boolean;
  collaborationState: string;
  onPaymentAction?: () => void;
}

export function CollaborationPaymentCard({
  payment,
  dealBudget,
  dealCurrency,
  isBrand,
  collaborationState,
  onPaymentAction,
}: CollaborationPaymentCardProps) {
  const { locale } = useTranslation();
  const [funding, setFunding] = useState(false);

  const status = payment?.status ?? "unpaid";
  const amount = payment?.amountInCents ?? dealBudget ?? 0;
  const currency = payment?.currency ?? dealCurrency;
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.unpaid;

  const showFundButton =
    isBrand &&
    status === "unpaid" &&
    amount > 0 &&
    collaborationState !== "completed";

  const showPaymentWarning =
    status === "unpaid" &&
    (collaborationState === "awaiting_creator_confirmation" ||
      collaborationState === "in_progress");

  const handleFund = async () => {
    if (!payment?.dealId) return;
    setFunding(true);
    try {
      const result = await initFunding(payment.dealId);
      if (result.success) {
        await confirmFunding(result.paymentId);
        onPaymentAction?.();
      }
    } finally {
      setFunding(false);
    }
  };

  return (
    <div className="relative pb-12">
      {/* Footer card — layered underneath */}
      <div className="absolute inset-x-0 bottom-0 h-20 rounded-2xl bg-primary" />

      {/* Primary card — elevated above footer */}
      <Card className="relative z-10 rounded-2xl ring-0 shadow-lg">
        <CardContent className="space-y-1.5 p-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Payment</h3>
            <Badge variant="outline" className={cn("text-xs", config.color)}>
              {config.label}
            </Badge>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-center gap-2 pt-8 pb-4">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary">
              <DollarSign className="size-6 text-[#FFF]" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {formatPrice(amount, currency, locale, false)}
            </p>
          </div>

          {/* Fund button */}
          {showFundButton && (
            <div className="flex justify-center">
              <Button
                onClick={handleFund}
                disabled={funding}
                className="cursor-pointer"
              >
                {funding ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Shield className="size-4" />
                )}
                Fund Deal
              </Button>
            </div>
          )}

          {/* Payment warning */}
          {showPaymentWarning && isBrand && (
            <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2">
              <Info className="size-3 shrink-0" />
              <p className="text-[10px]">
                Fund the deal to secure payment for the creator before work
                begins.
              </p>
            </div>
          )}
          {showPaymentWarning && !isBrand && (
            <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2">
              <Info className="size-3 shrink-0" />
              <p className="text-[10px]">
                Payment has not been funded yet. Work will be protected once the
                brand secures payment.
              </p>
            </div>
          )}

          {/* Release info */}
          {status === "released" && payment?.releasedAt && (
            <p className="text-xs text-muted-foreground">
              Released on{" "}
              {new Date(payment.releasedAt).toLocaleDateString(locale, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Footer label — sits on the green footer card */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex h-12 items-center justify-center gap-1 px-4 py-3">
        <Lock className="size-3.5 text-[#FFF]" />
        <p className="text-[11px] font-medium tracking-wide text-[#FFF]">
          Payments are protected on-platform
        </p>
      </div>
    </div>
  );
}
