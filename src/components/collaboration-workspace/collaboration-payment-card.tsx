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
} from "lucide-react";
import {
  initFunding,
  confirmFunding,
} from "@/app/(app)/deals/payment-actions";
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
    isBrand && status === "unpaid" && amount > 0 && collaborationState !== "completed";

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
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Payment
          </h3>
          <Badge
            variant="outline"
            className={cn("text-xs", config.color)}
          >
            {config.label}
          </Badge>
        </div>

        {/* Amount */}
        <div className={cn("flex items-center gap-3 rounded-lg p-3", config.bgColor)}>
          <div className="flex size-8 items-center justify-center rounded-full bg-background">
            {STATUS_ICONS[status]}
          </div>
          <div>
            <p className={cn("text-lg font-bold", config.textColor)}>
              {formatPrice(amount, currency, locale)}
            </p>
            <p className="text-xs text-muted-foreground">Deal value</p>
          </div>
        </div>

        {/* Payment warning */}
        {showPaymentWarning && isBrand && (
          <p className="text-xs text-amber-600">
            Fund the deal to secure payment for the creator before work begins.
          </p>
        )}
        {showPaymentWarning && !isBrand && (
          <p className="text-xs text-amber-600">
            Payment has not been funded yet. Work will be protected once the brand secures payment.
          </p>
        )}

        {/* Fund button */}
        {showFundButton && (
          <Button
            onClick={handleFund}
            disabled={funding}
            className="w-full cursor-pointer"
            size="sm"
          >
            {funding ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Shield className="size-3.5" />
            )}
            Fund Deal
          </Button>
        )}

        {/* Trust messaging for creator */}
        {!isBrand && status === "funded" && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
            <Lock className="size-3.5 text-primary" />
            <p className="text-xs text-primary">
              Payment is protected on-platform
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
  );
}
