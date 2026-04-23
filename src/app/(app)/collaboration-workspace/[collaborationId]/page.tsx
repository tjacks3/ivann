"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageContainer } from "@/components/shared/page-container";
import { LoadingState } from "@/components/shared/loading-state";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollaborationSummary } from "@/components/collaboration-workspace/collaboration-summary";
import { NextStepCard } from "@/components/collaboration-workspace/next-step-card";
import { BrandBriefForm } from "@/components/collaboration-workspace/brand-brief-form";
import { BriefReview } from "@/components/collaboration-workspace/brief-review";
import { DeliverableSubmission } from "@/components/collaboration-workspace/deliverable-submission";
import { BrandReviewActions } from "@/components/collaboration-workspace/brand-review-actions";
import {
  ActivityLog,
  CollabMessages,
} from "@/components/collaboration-workspace/collab-messages";
import { CollaborationPaymentCard } from "@/components/collaboration-workspace/collaboration-payment-card";

import { WaitingOnBadge } from "@/components/collaboration-workspace/waiting-on-badge";
import { StaleNudgeBanner } from "@/components/collaboration-workspace/stale-nudge-banner";
import { CompletionActions } from "@/components/collaboration-workspace/completion-actions";
import { useCollaborationWorkspace } from "@/hooks/use-collaboration-workspace";
import { useUser } from "@/hooks/use-user";
import {
  getCollaborationPayment,
  type CollabPaymentData,
} from "@/app/(app)/collaboration-workspace/actions";
import {
  initFunding,
  confirmFunding,
} from "@/app/(app)/deals/payment-actions";
import type { BriefValues } from "@/lib/validations/collaboration-workspace";
import { ArrowLeft, Pencil, Rocket, Lock, PanelRight } from "lucide-react";

export default function CollaborationWorkspacePage({
  params,
}: {
  params: Promise<{ collaborationId: string }>;
}) {
  const { collaborationId } = use(params);
  const { user } = useUser();
  const { collaboration, messages, isLoading, refetch } =
    useCollaborationWorkspace(collaborationId);

  const [briefSheetOpen, setBriefSheetOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch payment data
  const { data: payment, refetch: refetchPayment } = useQuery({
    queryKey: ["collaboration-payment", collaborationId],
    queryFn: () => getCollaborationPayment(collaborationId),
    staleTime: 30_000,
  });

  const handleRefresh = useCallback(() => {
    refetch();
    refetchPayment();
  }, [refetch, refetchPayment]);

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (!collaboration) {
    return (
      <PageContainer size="narrow">
        <div className="py-20 text-center">
          <p className="text-muted-foreground">
            Collaboration not found or you don&apos;t have access.
          </p>
          <Link
            href="/deals"
            className={buttonVariants({
              variant: "outline",
              className: "mt-4",
            })}
          >
            Back to Deals
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isBrand = user?.role === "brand";
  const isCreator = user?.role === "creator";
  const userRole = isBrand ? "brand" : "creator";
  const currentUserId = isBrand
    ? collaboration.brandUserId
    : collaboration.creatorId;
  const dashboardHref = isBrand ? "/brand/dashboard" : "/creator/dashboard";

  const canAddBrief =
    isBrand &&
    (collaboration.state === "awaiting_brand_brief" ||
      collaboration.state === "revision_requested");

  const showBriefReview =
    isCreator &&
    collaboration.state === "awaiting_creator_confirmation" &&
    collaboration.briefData;

  const showDeliverableSubmission =
    isCreator && collaboration.state === "in_progress";

  const showBrandReview =
    isBrand && collaboration.state === "submitted";

  const showBriefReadOnly =
    isBrand &&
    collaboration.state === "awaiting_creator_confirmation" &&
    collaboration.briefData;

  const showBriefSummary =
    collaboration.briefData &&
    !canAddBrief &&
    !showBriefReview &&
    !showBriefReadOnly &&
    ["in_progress", "submitted", "completed"].includes(collaboration.state);

  const handleNextStepAction = () => {
    if (canAddBrief) {
      setBriefSheetOpen(true);
    }
  };

  const handleFundDeal = async () => {
    if (!payment?.dealId) return;
    const result = await initFunding(payment.dealId);
    if (result.success) {
      await confirmFunding(result.paymentId);
      handleRefresh();
    }
  };

  const handleActivityAction = (actionType: string) => {
    if (actionType === "review_brief" || actionType === "update_brief") {
      setBriefSheetOpen(true);
    }
  };

  // Build secondary action for NextStepCard
  const secondaryAction =
    isBrand && payment?.status === "unpaid" && collaboration.state !== "completed"
      ? { label: "Fund Deal", onClick: handleFundDeal }
      : undefined;

  return (
    <PageContainer>
      {/* ─── Top Section ─────────────────────────────────────────────── */}

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={dashboardHref}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-3.5" />
          Back to Dashboard
        </Link>

        {/* Mobile sidebar toggle */}
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <PanelRight className="size-3.5" />
          Details
        </Button>
      </div>

      {/* Title + WaitingOnBadge */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
          <Rocket className="size-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Collaboration Workspace
          </p>
          <h1 className="text-xl font-semibold">{collaboration.dealTitle}</h1>
        </div>
        <WaitingOnBadge state={collaboration.state} userRole={userRole} />
      </div>

      {/* Next Step Card */}
      <div className="mt-3">
        <NextStepCard
          state={collaboration.state}
          isBrand={!!isBrand}
          onAction={handleNextStepAction}
          secondaryAction={secondaryAction}
          paymentStatus={payment?.status ?? null}
        />
      </div>

      {/* Stale Nudge Banner */}
      <div className="mt-3">
        <StaleNudgeBanner
          state={collaboration.state}
          updatedAt={collaboration.updatedAt}
          isBrand={!!isBrand}
        />
      </div>

      {/* ─── Main Content ────────────────────────────────────────────── */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left column — primary operating surface */}
        <div className="space-y-4">
          {/* Collaboration Summary — parties, deliverables, budget */}
          <CollaborationSummary collaboration={collaboration} />

          {/* Brand Brief Sheet */}
          {isBrand && collaboration.state !== "completed" && (
            <BrandBriefForm
              collaborationId={collaborationId}
              existingBrief={collaboration.briefData as BriefValues | null}
              existingDraft={collaboration.briefDraft}
              open={briefSheetOpen}
              onOpenChange={setBriefSheetOpen}
              onSuccess={handleRefresh}
            />
          )}

          {/* Creator Brief Review */}
          {showBriefReview && (
            <BriefReview
              collaborationId={collaborationId}
              briefData={collaboration.briefData as BriefValues}
              onSuccess={handleRefresh}
              paymentStatus={payment?.status ?? null}
            />
          )}

          {/* Brand read-only brief (waiting for creator) */}
          {showBriefReadOnly && (
            <BriefReadOnly
              briefData={collaboration.briefData as BriefValues}
              onEdit={() => setBriefSheetOpen(true)}
            />
          )}

          {/* Brief summary for later stages */}
          {showBriefSummary && (
            <BriefReadOnly
              briefData={collaboration.briefData as BriefValues}
              onEdit={
                isBrand && collaboration.state !== "completed"
                  ? () => setBriefSheetOpen(true)
                  : undefined
              }
            />
          )}

          {/* Deliverable Submission */}
          {showDeliverableSubmission && (
            <DeliverableSubmission
              collaborationId={collaborationId}
              dueDate={collaboration.dueDate}
              onSuccess={handleRefresh}
            />
          )}

          {/* Brand Review */}
          {showBrandReview && (
            <BrandReviewActions
              collaborationId={collaborationId}
              submittedUrl={collaboration.submittedUrl}
              submittedNote={collaboration.submittedNote}
              onSuccess={handleRefresh}
            />
          )}

          {/* Submitted deliverable read-only (for creator when waiting for review) */}
          {isCreator &&
            collaboration.state === "submitted" &&
            collaboration.submittedUrl && (
              <SubmittedReadOnly
                url={collaboration.submittedUrl}
                note={collaboration.submittedNote}
              />
            )}

          {/* Completion Actions */}
          {collaboration.state === "completed" && (
            <CompletionActions
              isBrand={!!isBrand}
              creatorName={collaboration.creatorName}
            />
          )}

          {/* Messages & Activity — tabbed layout */}
          <Tabs defaultValue="messages" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="messages" className="flex-1">
                Messages
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1">
                Activity
              </TabsTrigger>
            </TabsList>
            <TabsContent value="messages" className="mt-3">
              <CollabMessages
                collaborationId={collaborationId}
                messages={messages}
                currentUserId={currentUserId}
                onMessageSent={refetch}
              />
            </TabsContent>
            <TabsContent value="activity" className="mt-3">
              <ActivityLog
                messages={messages}
                onActionClick={handleActivityAction}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column — sidebar (desktop persistent, mobile collapsible) */}
        <div className={`space-y-4 ${sidebarOpen ? "" : "hidden lg:block"}`}>
          {/* Payment Card */}
          <CollaborationPaymentCard
            payment={payment ?? null}
            dealBudget={collaboration.budgetAmount}
            dealCurrency={collaboration.dealCurrency}
            isBrand={!!isBrand}
            collaborationState={collaboration.state}
            onPaymentAction={handleRefresh}
          />

          {/* Trust messaging */}
          <Card>
            <CardContent className="flex items-center gap-2 p-4">
              <Lock className="size-4 shrink-0 text-primary" />
              <p className="text-xs text-muted-foreground">
                Communication and payments are protected on-platform
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

// ─── Read-only brief display ───────────────────────────────────────────────

function BriefReadOnly({
  briefData,
  onEdit,
}: {
  briefData: BriefValues;
  onEdit?: () => void;
}) {
  const fields: { key: keyof BriefValues; label: string }[] = [
    { key: "campaignGoal", label: "Campaign Goal" },
    { key: "productOrService", label: "Product / Service" },
    { key: "requiredMentions", label: "Required Mentions" },
    { key: "tagsHashtags", label: "Tags / Hashtags" },
    { key: "location", label: "Location" },
    { key: "postingWindowStart", label: "Posting Window Start" },
    { key: "postingWindowEnd", label: "Posting Window End" },
    { key: "specialInstructions", label: "Special Instructions" },
    { key: "restrictions", label: "Restrictions" },
  ];

  const activeFields = fields.filter(({ key }) => briefData[key]);

  return (
    <div className="rounded-xl bg-muted/30 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Campaign Brief</h3>
        {onEdit && (
          <Button
            variant="outline"
            size="xs"
            onClick={onEdit}
            className="cursor-pointer"
          >
            <Pencil className="size-3" />
            Edit Brief
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {activeFields.map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="whitespace-pre-wrap text-sm text-foreground">
              {briefData[key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Submitted deliverable read-only ───────────────────────────────────────

function SubmittedReadOnly({
  url,
  note,
}: {
  url: string;
  note: string | null;
}) {
  return (
    <div className="rounded-xl border p-5">
      <h3 className="mb-3 text-sm font-semibold">Submitted Deliverable</h3>
      <div className="rounded-lg border p-3">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Content URL
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {url}
        </a>
      </div>
      {note && (
        <div className="mt-3 rounded-lg border p-3">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Note
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{note}</p>
        </div>
      )}
    </div>
  );
}
