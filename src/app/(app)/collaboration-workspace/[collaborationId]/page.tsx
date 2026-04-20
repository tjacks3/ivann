"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { LoadingState } from "@/components/shared/loading-state";
import { buttonVariants } from "@/components/ui/button-variants";
import { ProgressTracker } from "@/components/collaboration-workspace/progress-tracker";
import { CollaborationSummary } from "@/components/collaboration-workspace/collaboration-summary";
import { NextStepCard } from "@/components/collaboration-workspace/next-step-card";
import { BrandBriefForm } from "@/components/collaboration-workspace/brand-brief-form";
import { BriefReview } from "@/components/collaboration-workspace/brief-review";
import { DeliverableSubmission } from "@/components/collaboration-workspace/deliverable-submission";
import { BrandReviewActions } from "@/components/collaboration-workspace/brand-review-actions";
import { CollabMessages } from "@/components/collaboration-workspace/collab-messages";
import { useCollaborationWorkspace } from "@/hooks/use-collaboration-workspace";
import { useUser } from "@/hooks/use-user";
import type { BriefValues } from "@/lib/validations/collaboration-workspace";
import { ArrowLeft } from "lucide-react";

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

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

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
    isCreator &&
    collaboration.state === "in_progress";

  const showBrandReview =
    isBrand &&
    collaboration.state === "submitted";

  // Read-only brief display for brand when waiting for creator confirmation
  const showBriefReadOnly =
    isBrand &&
    collaboration.state === "awaiting_creator_confirmation" &&
    collaboration.briefData;

  // Read-only brief for in_progress / submitted / completed states
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

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={dashboardHref}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-3.5" />
          Back to Dashboard
        </Link>
      </div>

      <h1 className="text-xl font-semibold">{collaboration.dealTitle}</h1>

      {/* Progress Tracker */}
      <div className="mt-4">
        <ProgressTracker state={collaboration.state} />
      </div>

      {/* Summary Card */}
      <div className="mt-4">
        <CollaborationSummary collaboration={collaboration} />
      </div>

      {/* Next Step Card */}
      {collaboration.state !== "completed" && (
        <div className="mt-4">
          <NextStepCard
            state={collaboration.state}
            isBrand={!!isBrand}
            onAction={handleNextStepAction}
          />
        </div>
      )}

      {/* Completed state */}
      {collaboration.state === "completed" && (
        <div className="mt-4">
          <NextStepCard state="completed" isBrand={!!isBrand} />
        </div>
      )}

      {/* Brand Brief Sheet */}
      {canAddBrief && (
        <BrandBriefForm
          collaborationId={collaborationId}
          existingBrief={collaboration.briefData as BriefValues | null}
          open={briefSheetOpen}
          onOpenChange={setBriefSheetOpen}
          onSuccess={handleRefresh}
        />
      )}

      {/* Action sections */}
      <div className="mt-6 space-y-4">
        {/* Creator Brief Review */}
        {showBriefReview && (
          <BriefReview
            collaborationId={collaborationId}
            briefData={collaboration.briefData as BriefValues}
            onSuccess={handleRefresh}
          />
        )}

        {/* Brand read-only brief (waiting for creator) */}
        {showBriefReadOnly && (
          <BriefReadOnly briefData={collaboration.briefData as BriefValues} />
        )}

        {/* Brief summary for later stages */}
        {showBriefSummary && (
          <BriefReadOnly briefData={collaboration.briefData as BriefValues} />
        )}

        {/* Deliverable Submission */}
        {showDeliverableSubmission && (
          <DeliverableSubmission
            collaborationId={collaborationId}
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
        {isCreator && collaboration.state === "submitted" && collaboration.submittedUrl && (
          <SubmittedReadOnly
            url={collaboration.submittedUrl}
            note={collaboration.submittedNote}
          />
        )}
      </div>

      {/* Messages */}
      <div className="mt-6">
        <CollabMessages
          collaborationId={collaborationId}
          messages={messages}
          currentUserId={currentUserId}
          onMessageSent={refetch}
        />
      </div>
    </PageContainer>
  );
}

// ─── Read-only brief display ───────────────────────────────────────────────

function BriefReadOnly({ briefData }: { briefData: BriefValues }) {
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

  return (
    <div className="rounded-xl border p-5">
      <h3 className="mb-3 text-sm font-semibold">Campaign Brief</h3>
      <div className="space-y-3">
        {fields.map(({ key, label }) => {
          const value = briefData[key];
          if (!value) return null;
          return (
            <div key={key} className="rounded-lg border p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {label}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{value}</p>
            </div>
          );
        })}
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
