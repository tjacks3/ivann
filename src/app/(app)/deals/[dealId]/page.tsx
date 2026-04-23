"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/shared/page-container";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { DealSummaryCard } from "@/components/deals/deal-summary-card";
import { DealPaymentSection } from "@/components/deals/deal-payment-section";
import { DealEditSheet } from "@/components/deals/deal-edit-sheet";
import { DealCounterSheet } from "@/components/deals/deal-counter-sheet";
import { DealRevisionTimeline } from "@/components/deals/deal-revision-timeline";
import { ChatView } from "@/components/messages/chat-view";
import { useDeal } from "@/hooks/use-deals";
import { useUser } from "@/hooks/use-user";
import {
  editProposal,
  submitCounterProposal,
  updateDealStatus,
  getDealRevisions,
  type RevisionItem,
} from "@/app/(app)/deals/actions";
import {
  initFunding,
  confirmFunding,
  getDealPayment,
  type DealPaymentInfo,
} from "@/app/(app)/deals/payment-actions";
import { getCollaborationByDealId } from "@/app/(app)/collaboration-workspace/actions";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/i18n";
import {
  ArrowLeft,
  CheckCircle,
  Play,
  PackageCheck,
  ThumbsUp,
  XCircle,
  Loader2,
  Rocket,
} from "lucide-react";

export default function DealWorkspacePage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const { dealId } = use(params);
  const { t } = useTranslation();
  const { user } = useUser();
  const { deal, isLoading, refetch } = useDeal(dealId);
  const queryClient = useQueryClient();
  const router = useRouter();
  const redirectedRef = useRef(false);

  const [editOpen, setEditOpen] = useState(false);
  const [counterOpen, setCounterOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [payment, setPayment] = useState<DealPaymentInfo | null>(null);
  const [collabId, setCollabId] = useState<string | null>(null);

  // Load revisions + payment + collaboration link
  useEffect(() => {
    if (dealId) {
      getDealRevisions(dealId).then(setRevisions);
      getDealPayment(dealId).then(setPayment);
      getCollaborationByDealId(dealId).then((c) => setCollabId(c?.id ?? null));
    }
  }, [dealId]);

  // Auto-redirect QuickCollab deals to collaboration workspace
  useEffect(() => {
    if (deal?.collabRequestId && collabId && !redirectedRef.current) {
      redirectedRef.current = true;
      router.replace(`/collaboration-workspace/${collabId}`);
    }
  }, [deal?.collabRequestId, collabId, router]);

  const refreshAll = () => {
    refetch();
    getDealPayment(dealId).then(setPayment);
    getDealRevisions(dealId).then(setRevisions);
    queryClient.invalidateQueries({ queryKey: ["deals"] });
  };

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (!deal) {
    return (
      <PageContainer size="narrow">
        <div className="py-20 text-center">
          <p className="text-muted-foreground">{t("deal.notFound")}</p>
          <Link
            href="/brand/dashboard"
            className={buttonVariants({ variant: "outline", className: "mt-4" })}
          >
            {t("deal.backToDashboard")}
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isBrand = user?.role === "brand";
  const isCreator = user?.role === "creator";
  const isNegotiable = deal.status === "draft" || deal.status === "negotiating";
  const showCancel = deal.status !== "completed" && deal.status !== "cancelled" && deal.status !== "delivered";

  const handleEditSave = async (data: {
    title: string;
    deliverables: string;
    budget: number | undefined;
    timeline: string;
    notes: string;
  }) => {
    await editProposal(deal.id, data);
    refreshAll();
  };

  const handleCounterSubmit = async (data: {
    deliverables: string;
    budget: number | undefined;
    timeline: string;
    notes: string;
  }) => {
    await submitCounterProposal(deal.id, data);
    refreshAll();
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatusLoading(true);
    const result = await updateDealStatus(deal.id, newStatus);
    if (result.success) {
      refreshAll();
    }
    setStatusLoading(false);
  };

  const handleFundDeal = async () => {
    const result = await initFunding(deal.id);
    if (result.success) {
      await confirmFunding(result.paymentId);
      refreshAll();
    }
  };

  // Status actions based on role + current status
  const statusActions: {
    label: string;
    status: string;
    icon: React.ReactNode;
    variant?: "default" | "outline" | "destructive";
  }[] = [];

  if (isCreator && isNegotiable) {
    statusActions.push({
      label: t("deal.action.accept"),
      status: "accepted",
      icon: <CheckCircle className="size-3.5" />,
      variant: "default",
    });
  }
  if (isCreator && deal.status === "accepted") {
    statusActions.push({
      label: t("deal.action.startWork"),
      status: "in_progress",
      icon: <Play className="size-3.5" />,
      variant: "default",
    });
  }
  if (isCreator && deal.status === "in_progress") {
    statusActions.push({
      label: t("deal.action.markDelivered"),
      status: "delivered",
      icon: <PackageCheck className="size-3.5" />,
      variant: "default",
    });
  }
  if (isBrand && deal.status === "delivered" && payment?.status === "funded") {
    statusActions.push({
      label: t("deal.action.complete"),
      status: "completed",
      icon: <ThumbsUp className="size-3.5" />,
      variant: "default",
    });
  }

  const dashboardHref = isBrand ? "/brand/dashboard" : "/creator/dashboard";

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={dashboardHref}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-3.5" />
          {t("deal.backToDashboard")}
        </Link>
      </div>

      {/* Summary card */}
      <div className="mt-4">
        <DealSummaryCard
          deal={deal}
          isBrand={!!isBrand}
          isNegotiable={isNegotiable}
          hasRevisions={revisions.length > 0}
          onEdit={() => setEditOpen(true)}
          onCounter={() => setCounterOpen(true)}
        />
      </div>

      {/* Status actions (hidden when collaboration workspace manages transitions) */}
      {!collabId && (statusActions.length > 0 || showCancel) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {statusActions.map((action) => (
            <Button
              key={action.status}
              variant={action.variant ?? "outline"}
              size="sm"
              onClick={() => handleStatusChange(action.status)}
              disabled={statusLoading}
              className="cursor-pointer"
            >
              {statusLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                action.icon
              )}
              {action.label}
            </Button>
          ))}
          {showCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setCancelConfirmOpen(true)}
              disabled={statusLoading}
              className="cursor-pointer"
            >
              <XCircle className="size-3.5" />
              {t("deal.action.cancel")}
            </Button>
          )}
        </div>
      )}

      {/* Collaboration workspace link */}
      {collabId && (
        <div className="mt-4">
          <Link
            href={`/collaboration-workspace/${collabId}`}
            className={buttonVariants({ variant: "default" })}
          >
            <Rocket className="size-3.5" />
            Go to Collaboration Workspace
          </Link>
        </div>
      )}

      {/* Payment section */}
      <div className="mt-4">
        <DealPaymentSection
          payment={payment}
          dealBudget={deal.budget}
          dealCurrency={deal.currency}
          isBrand={!!isBrand}
          dealStatus={deal.status}
          onFund={handleFundDeal}
        />
      </div>

      {/* Revision timeline */}
      {revisions.length > 0 && (
        <div className="mt-6">
          <DealRevisionTimeline
            revisions={revisions}
            isBrand={!!isBrand}
            isNegotiable={isNegotiable}
            onEdit={() => setEditOpen(true)}
            onCounter={() => setCounterOpen(true)}
          />
        </div>
      )}

      {/* Chat */}
      {deal.threadId && (
        <div className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="flex h-[500px] flex-col">
                <ChatView threadId={deal.threadId} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit sheet (brand only) */}
      {isBrand && isNegotiable && (
        <DealEditSheet
          deal={deal}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSave={handleEditSave}
        />
      )}

      {/* Counter-proposal sheet (creator only) */}
      {isCreator && isNegotiable && (
        <DealCounterSheet
          deal={deal}
          open={counterOpen}
          onOpenChange={setCounterOpen}
          onSubmit={handleCounterSubmit}
        />
      )}

      {/* Cancel confirmation */}
      {cancelConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 w-full max-w-sm">
            <CardContent className="space-y-4 pt-6">
              <div className="text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10">
                  <XCircle className="size-6 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold">
                  {t("deal.cancel.title")}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isBrand
                    ? t("deal.cancel.brandMessage")
                    : t("deal.cancel.creatorMessage")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 cursor-pointer"
                  onClick={() => setCancelConfirmOpen(false)}
                >
                  {t("deal.cancel.goBack")}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 cursor-pointer"
                  disabled={statusLoading}
                  onClick={async () => {
                    await handleStatusChange("cancelled");
                    setCancelConfirmOpen(false);
                  }}
                >
                  {statusLoading && <Loader2 className="size-3.5 animate-spin" />}
                  {t("deal.cancel.confirm")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
