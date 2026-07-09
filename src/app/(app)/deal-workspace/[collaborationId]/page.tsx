"use client";

import { use, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageContainer } from "@/components/shared/page-container";
import { LoadingState } from "@/components/shared/loading-state";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollaborationSummary } from "@/components/deal-workspace/collaboration-summary";
import { NextStepCard } from "@/components/deal-workspace/next-step-card";
import { BrandBriefForm } from "@/components/deal-workspace/brand-brief-form";
import { BriefReview } from "@/components/deal-workspace/brief-review";
import { BriefRevisionView } from "@/components/deal-workspace/brief-revision-view";
import { DeliverableSubmission } from "@/components/deal-workspace/deliverable-submission";
import { BrandReviewActions } from "@/components/deal-workspace/brand-review-actions";
import {
  ActivityLog,
  CollabMessages,
} from "@/components/deal-workspace/collab-messages";
import { CollaborationPaymentCard } from "@/components/deal-workspace/collaboration-payment-card";

import { WaitingOnBadge } from "@/components/deal-workspace/waiting-on-badge";
import { StaleNudgeBanner } from "@/components/deal-workspace/stale-nudge-banner";
import { CompletionActions } from "@/components/deal-workspace/completion-actions";
import { useCollaborationWorkspace } from "@/hooks/use-deal-workspace";
import { useUser } from "@/hooks/use-user";
import {
  getCollaborationPayment,
  submitBrief,
  type CollabPaymentData,
} from "@/app/(app)/deal-workspace/actions";
import { updateDealStatus } from "@/app/(app)/deals/actions";
import { initFunding, confirmFunding } from "@/app/(app)/deals/payment-actions";
import type { BriefValues } from "@/lib/validations/deal-workspace";
import { ArrowLeft, Pencil, Rocket, Lock, PanelRight, FileText } from "lucide-react";

export default function CollaborationWorkspacePage({
  params,
}: {
  params: Promise<{ collaborationId: string }>;
}) {
  const { collaborationId } = use(params);
  const { user } = useUser();

  const [briefSheetOpen, setBriefSheetOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const isMessagesActive = activeTab === "messages";

  const { collaboration, messages, isLoading, refetch } =
    useCollaborationWorkspace(collaborationId, { isMessagesActive });

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

  const isBriefState =
    collaboration.state === "awaiting_brand_brief" ||
    collaboration.state === "revision_requested";

  const isPaymentFunded = payment?.status === "funded";

  const canAddBrief = isBrand && isBriefState && isPaymentFunded;

  const needsPaymentBeforeBrief = isBrand && isBriefState && !isPaymentFunded;

  const showBriefReview =
    isCreator &&
    collaboration.state === "awaiting_creator_confirmation" &&
    collaboration.briefData;

  const showDeliverableSubmission =
    isCreator && collaboration.state === "in_progress";

  const isDeliverableResubmission =
    showDeliverableSubmission &&
    collaboration.revisionRequestedAt !== null;

  const deliverableRevisionFeedback = isDeliverableResubmission
    ? messages
        .filter(
          (m) => !m.isSystemEvent && m.senderId === collaboration.brandUserId,
        )
        .at(-1) ?? null
    : null;

  const showBrandReview = isBrand && collaboration.state === "submitted";

  const showBriefReadOnly =
    isBrand &&
    collaboration.state === "awaiting_creator_confirmation" &&
    collaboration.briefData;

  const showBriefRevision =
    collaboration.state === "revision_requested" && collaboration.briefData;

  const showBriefSummary =
    collaboration.briefData &&
    !canAddBrief &&
    !showBriefReview &&
    !showBriefReadOnly &&
    !showBriefRevision &&
    ["in_progress", "submitted", "completed"].includes(collaboration.state);

  // Get the last non-system message as the revision request message
  const revisionMsg = showBriefRevision
    ? messages
        .filter((m) => !m.isSystemEvent && m.senderId === collaboration.creatorId)
        .at(-1) ?? null
    : null;
  const revisionMessage = revisionMsg?.body ?? null;
  const revisionRequestedAt = revisionMsg?.createdAt ?? null;

  const scrollToTab = (tab: string) => {
    setActiveTab(tab);
    setTimeout(() => {
      tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleKeepCurrentBrief = async () => {
    if (!collaboration.briefData) return;
    await submitBrief(collaborationId, collaboration.briefData as BriefValues);
    handleRefresh();
  };

  const handleCancelDeal = async () => {
    if (!collaboration.dealId) return;
    await updateDealStatus(collaboration.dealId, "cancelled");
    handleRefresh();
  };

  const handleNextStepAction = () => {
    if (needsPaymentBeforeBrief) {
      handleFundDeal();
      return;
    }
    if (canAddBrief) {
      setBriefSheetOpen(true);
    } else if (showBriefReview) {
      scrollToTab("brief");
    } else if (showDeliverableSubmission) {
      scrollToTab("details");
    } else if (showBrandReview) {
      scrollToTab("details");
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
    if (actionType === "update_brief") {
      setBriefSheetOpen(true);
    } else if (actionType === "review_brief") {
      scrollToTab("brief");
    } else if (
      actionType === "review_deliverable" ||
      actionType === "start_work"
    ) {
      scrollToTab("details");
    }
  };

  // Build secondary action for NextStepCard
  const secondaryAction =
    isBrand &&
    payment?.status === "unpaid" &&
    collaboration.state !== "completed"
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
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Deal Workspace
        </p>
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
          revisionRequestedAt={collaboration.revisionRequestedAt}
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
          {/* Collaboration Summary — parties, budget, timeline */}
          <CollaborationSummary collaboration={collaboration} />

          {/* Brand Brief Sheet (modal) */}
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

          {/* Completion Actions */}
          {collaboration.state === "completed" && (
            <CompletionActions
              isBrand={!!isBrand}
              creatorName={collaboration.creatorName}
            />
          )}

          {/* Tabbed content: Campaign Brief / Collaboration Details / Messages */}
          <Tabs
            ref={tabsRef}
            value={activeTab ?? (collaboration.briefData ? "brief" : "details")}
            onValueChange={(val) => setActiveTab(val)}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="brief" className="flex-1">
                Campaign Brief
              </TabsTrigger>
              <TabsTrigger value="details" className="flex-1">
                Deal Details
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex-1">
                Messages
              </TabsTrigger>
            </TabsList>

            {/* Campaign Brief tab */}
            <TabsContent value="brief" className="mt-3 space-y-4">
              {/* Brief revision view (revision_requested state) */}
              {showBriefRevision && (
                <BriefRevisionView
                  briefData={collaboration.briefData as BriefValues}
                  revisionMessage={revisionMessage}
                  revisionRequestedAt={revisionRequestedAt}
                  isBrand={!!isBrand}
                  onUpdateBrief={isBrand ? () => setBriefSheetOpen(true) : undefined}
                  onAcceptUpdates={isBrand ? handleKeepCurrentBrief : undefined}
                  onCancel={isBrand ? handleCancelDeal : undefined}
                />
              )}

              {/* Creator Brief Review (awaiting confirmation) */}
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

              {/* No brief yet */}
              {!collaboration.briefData && (
                <div className="rounded-xl bg-muted/30 p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {needsPaymentBeforeBrief
                      ? "Fund the deal before adding the campaign brief."
                      : isBrand
                        ? "No campaign brief yet. Add one to get started."
                        : "The brand hasn't submitted a campaign brief yet."}
                  </p>
                  {needsPaymentBeforeBrief && (
                    <Button
                      className="mt-3 cursor-pointer"
                      size="sm"
                      onClick={handleFundDeal}
                    >
                      <Lock className="size-3.5" />
                      Fund Deal First
                    </Button>
                  )}
                  {canAddBrief && (
                    <Button
                      className="mt-3 cursor-pointer"
                      size="sm"
                      onClick={() => setBriefSheetOpen(true)}
                    >
                      Add Brief
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Collaboration Details tab */}
            <TabsContent value="details" className="mt-3 space-y-4">
              {/* Deliverable Submission (creator, in_progress) */}
              {showDeliverableSubmission && (
                <DeliverableSubmission
                  collaborationId={collaborationId}
                  dueDate={collaboration.dueDate}
                  onSuccess={handleRefresh}
                  isResubmission={isDeliverableResubmission}
                  revisionFeedbackBody={deliverableRevisionFeedback?.body ?? null}
                  revisionFeedbackAt={deliverableRevisionFeedback?.createdAt ?? null}
                />
              )}

              {/* Brand Review (brand, submitted) */}
              {showBrandReview && (
                <BrandReviewActions
                  collaborationId={collaborationId}
                  submittedUrl={collaboration.submittedUrl}
                  submittedNote={collaboration.submittedNote}
                  onSuccess={handleRefresh}
                />
              )}

              {/* Submitted deliverable read-only (waiting for review or completed) */}
              {(collaboration.state === "submitted" ||
                collaboration.state === "completed") &&
                collaboration.submittedUrl && (
                  <SubmittedReadOnly
                    url={collaboration.submittedUrl}
                    note={collaboration.submittedNote}
                  />
                )}

              {/* Activity log */}
              <ActivityLog
                messages={messages}
                onActionClick={handleActivityAction}
              />

              {/* Empty state when nothing to show yet */}
              {!showDeliverableSubmission &&
                !showBrandReview &&
                !(isCreator && collaboration.state === "submitted") &&
                messages.filter((m) => m.isSystemEvent).length === 0 && (
                  <div className="rounded-xl bg-muted/30 p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No collaboration activity yet. Details will appear here as
                      the collaboration progresses.
                    </p>
                  </div>
                )}
            </TabsContent>

            {/* Messages tab */}
            <TabsContent value="messages" className="mt-3">
              <CollabMessages
                collaborationId={collaborationId}
                messages={messages}
                currentUserId={currentUserId}
                onMessageSent={refetch}
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4" />
            Campaign Brief
          </CardTitle>
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
      </CardHeader>
      <CardContent>
        <div className="rounded-xl bg-muted/30 p-4">
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {activeFields.map(({ key, label }) => (
              <div key={key} className="space-y-1 p-2">
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
      </CardContent>
    </Card>
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
