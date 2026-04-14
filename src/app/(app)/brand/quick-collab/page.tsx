"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { IntakeStepper } from "@/components/quick-collab/intake-stepper";
import { StepCollabType } from "@/components/quick-collab/step-collab-type";
import { StepCampaignIntent } from "@/components/quick-collab/step-campaign-intent";
import { StepLocalPreference } from "@/components/quick-collab/step-local-preference";
import { StepBudget } from "@/components/quick-collab/step-budget";
import { StepTiming } from "@/components/quick-collab/step-timing";
import { CreatorMatchList } from "@/components/quick-collab/creator-match-list";
import { CreatorDetailDrawer } from "@/components/quick-collab/creator-detail-drawer";
import { CampaignSummary } from "@/components/quick-collab/campaign-summary";
import { OutreachEditor } from "@/components/quick-collab/outreach-editor";
import { useQuickCollab } from "@/hooks/use-quick-collab";
import { useBrandProfile } from "@/hooks/use-brand-profile";
import { useTranslation } from "@/i18n";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import type { MatchedCreator, OutreachDraft } from "@/app/(app)/brand/quick-collab/actions";
import type { QuickCollabCampaign } from "@/db/schema/quick-collab";

type WizardStep =
  | "collab_type"
  | "campaign_intent"
  | "local_preference"
  | "budget"
  | "timing"
  | "matching"
  | "campaign"
  | "outreach"
  | "success";

const INTAKE_STEPS: WizardStep[] = [
  "collab_type",
  "campaign_intent",
  "local_preference",
  "budget",
  "timing",
];

const ALL_STEPS: WizardStep[] = [
  ...INTAKE_STEPS,
  "matching",
  "campaign",
  "outreach",
  "success",
];

export default function QuickCollabPage() {
  const { t } = useTranslation();
  const { profile } = useBrandProfile();
  const {
    createRequest,
    matchCreators,
    updateMatchStatus,
    generateCampaign,
    updateCampaign,
    generateMessages,
    updateMessage,
    sendOutreaches,
  } = useQuickCollab();

  // Wizard state
  const [step, setStep] = useState<WizardStep>("collab_type");
  const [loading, setLoading] = useState(false);

  // Intake form data
  const [collabType, setCollabType] = useState("");
  const [collabTypeOther, setCollabTypeOther] = useState("");
  const [campaignIntent, setCampaignIntent] = useState("");
  const [localOnly, setLocalOnly] = useState(false);
  const [radius, setRadius] = useState(30);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [timing, setTiming] = useState("");
  const [notes, setNotes] = useState("");

  // Post-intake state
  const [requestId, setRequestId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchedCreator[]>([]);
  const [matchStatuses, setMatchStatuses] = useState<
    Record<string, "recommended" | "selected" | "skipped">
  >({});
  const [campaign, setCampaign] = useState<QuickCollabCampaign | null>(null);
  const [outreaches, setOutreaches] = useState<OutreachDraft[]>([]);
  const [sentCount, setSentCount] = useState(0);
  const [matchLocalLowResults, setMatchLocalLowResults] = useState(false);
  const [matchLocalOnly, setMatchLocalOnly] = useState(false);

  // Detail drawer
  const [detailMatch, setDetailMatch] = useState<MatchedCreator | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const stepIndex = ALL_STEPS.indexOf(step);

  const STEP_LABELS: Record<WizardStep, string> = {
    collab_type: t("quickCollab.stepLabel.collabType"),
    campaign_intent: t("quickCollab.stepLabel.intent"),
    local_preference: t("quickCollab.stepLabel.localPreference"),
    budget: t("quickCollab.stepLabel.budget"),
    timing: t("quickCollab.stepLabel.timing"),
    matching: t("quickCollab.stepLabel.matching"),
    campaign: t("quickCollab.stepLabel.campaign"),
    outreach: t("quickCollab.stepLabel.outreach"),
    success: t("quickCollab.stepLabel.success"),
  };

  // Validation per step
  const canProceed = useCallback((): boolean => {
    switch (step) {
      case "collab_type":
        if (collabType === "other") return collabTypeOther.trim() !== "";
        return collabType !== "";
      case "campaign_intent":
        return campaignIntent.trim() !== "";
      case "local_preference":
        if (localOnly && !profile?.location) {
          return city.trim() !== "" && state.trim() !== "";
        }
        return true;
      case "budget":
        return budgetRange !== "";
      case "timing":
        return timing !== "";
      case "matching":
        return Object.values(matchStatuses).some((s) => s === "selected");
      case "campaign":
        return campaign !== null;
      case "outreach":
        return outreaches.length > 0;
      default:
        return true;
    }
  }, [
    step,
    collabType,
    collabTypeOther,
    campaignIntent,
    localOnly,
    profile?.location,
    city,
    state,
    budgetRange,
    timing,
    matchStatuses,
    campaign,
    outreaches,
  ]);

  const handleNext = async () => {
    if (step === "timing") {
      // Submit intake + run matching
      setLoading(true);

      // Auto-fill from profile
      const businessName = profile?.brandName ?? profile?.fullName ?? "My Business";
      const businessCategory = profile?.industry ?? "other";

      // Location: use profile location or manual input when localOnly
      let reqCity = "";
      let reqState = "";
      if (localOnly) {
        if (profile?.location) {
          const parts = profile.location.split(",").map((s) => s.trim());
          reqCity = parts[0] ?? "";
          reqState = parts[1] ?? "";
        } else {
          reqCity = city.trim();
          reqState = state.trim();
        }
      }

      const result = await createRequest({
        businessName,
        businessCategory: businessCategory as "fashion" | "tech" | "lifestyle" | "fitness" | "food" | "travel" | "education" | "entertainment" | "business" | "other",
        collabType: collabType as "instagram_story" | "instagram_post" | "youtube_promo" | "tiktok_post" | "podcast_mention" | "other",
        collabTypeOther: collabType === "other" ? collabTypeOther.trim() : undefined,
        campaignIntent: campaignIntent.trim(),
        localOnly,
        city: reqCity || undefined,
        state: reqState || undefined,
        radius: localOnly ? radius : undefined,
        budgetRange: budgetRange as "under_50" | "50_100" | "100_250" | "250_500" | "500_plus",
        timing: timing as "asap" | "this_week" | "this_month" | "flexible",
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        setRequestId(result.requestId);
        const matchResult = await matchCreators(result.requestId);
        if (matchResult.success) {
          setMatches(matchResult.matches);
          setMatchLocalLowResults(matchResult.localLowResults ?? false);
          setMatchLocalOnly(localOnly);
          const initialStatuses: Record<string, "recommended"> = {};
          matchResult.matches.forEach((m) => {
            initialStatuses[m.matchId] = "recommended";
          });
          setMatchStatuses(initialStatuses);
        }
      }
      setLoading(false);
      setStep("matching");
    } else if (step === "matching") {
      if (!requestId) return;
      setLoading(true);
      const result = await generateCampaign(requestId);
      if (result.success) {
        setCampaign(result.campaign);
      }
      setLoading(false);
      setStep("campaign");
    } else if (step === "campaign") {
      if (!campaign) return;
      setLoading(true);
      const result = await generateMessages(campaign.id);
      if (result.success) {
        setOutreaches(result.outreaches);
      }
      setLoading(false);
      setStep("outreach");
    } else {
      const nextIndex = stepIndex + 1;
      if (nextIndex < ALL_STEPS.length) {
        setStep(ALL_STEPS[nextIndex]);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setStep(ALL_STEPS[prevIndex]);
    }
  };

  const handleSelectMatch = async (matchId: string) => {
    setMatchStatuses((prev) => ({ ...prev, [matchId]: "selected" }));
    await updateMatchStatus(matchId, "selected");
  };

  const handleSkipMatch = async (matchId: string) => {
    const prev = matchStatuses[matchId];
    const newStatus = prev === "selected" ? "recommended" : "skipped";
    setMatchStatuses((p) => ({ ...p, [matchId]: newStatus as "recommended" | "skipped" }));
    await updateMatchStatus(matchId, "skipped");
  };

  const handleSendOutreaches = async (outreachIds: string[]) => {
    setLoading(true);
    const result = await sendOutreaches(outreachIds);
    if (result.success) {
      setSentCount(result.sentCount);
      setStep("success");
    }
    setLoading(false);
  };

  const handleUpdateOutreachMessage = async (
    outreachId: string,
    message: string,
  ) => {
    await updateMessage(outreachId, message);
    setOutreaches((prev) =>
      prev.map((o) => (o.id === outreachId ? { ...o, message } : o)),
    );
  };

  const handleCampaignSave = async (data: {
    goal: string;
    deliverable: string;
    budgetPerCreator: string;
    timeline: string;
    summary: string;
  }) => {
    if (!campaign) return;
    await updateCampaign(campaign.id, data);
    setCampaign({ ...campaign, ...data, isEdited: true });
  };

  // Success screen
  if (step === "success") {
    return (
      <PageContainer size="narrow">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle className="size-8" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">
            {t("quickCollab.success.title")}
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {t("quickCollab.success.description", { count: sentCount })}
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Link
              href="/brand/quick-collab/tracking"
              className={buttonVariants()}
            >
              {t("quickCollab.success.viewTracking")}
            </Link>
            <Link
              href="/brand/dashboard"
              className={buttonVariants({ variant: "outline" })}
            >
              {t("quickCollab.success.backToDashboard")}
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  const isWideStep = step === "matching" || step === "campaign" || step === "outreach";

  return (
    <PageContainer size={isWideStep ? "default" : "narrow"}>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/brand/dashboard"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-3.5" />
          {t("quickCollab.backToDashboard")}
        </Link>
      </div>

      {/* Stepper */}
      <IntakeStepper
        currentStep={stepIndex}
        totalSteps={ALL_STEPS.length - 1}
        stepLabel={STEP_LABELS[step]}
      />

      {/* Step content */}
      <div className="mt-8">
        {loading && <LoadingState variant="spinner" />}

        {!loading && step === "collab_type" && (
          <StepCollabType
            collabType={collabType}
            collabTypeOther={collabTypeOther}
            onCollabTypeChange={setCollabType}
            onCollabTypeOtherChange={setCollabTypeOther}
          />
        )}

        {!loading && step === "campaign_intent" && (
          <StepCampaignIntent
            campaignIntent={campaignIntent}
            onCampaignIntentChange={setCampaignIntent}
          />
        )}

        {!loading && step === "local_preference" && (
          <StepLocalPreference
            localOnly={localOnly}
            radius={radius}
            brandLocation={profile?.location ?? null}
            city={city}
            state={state}
            onLocalOnlyChange={setLocalOnly}
            onRadiusChange={setRadius}
            onCityChange={setCity}
            onStateChange={setState}
          />
        )}

        {!loading && step === "budget" && (
          <StepBudget
            budgetRange={budgetRange}
            onBudgetRangeChange={setBudgetRange}
          />
        )}

        {!loading && step === "timing" && (
          <StepTiming
            timing={timing}
            notes={notes}
            onTimingChange={setTiming}
            onNotesChange={setNotes}
          />
        )}

        {!loading && step === "matching" && (
          <CreatorMatchList
            matches={matches}
            matchStatuses={matchStatuses}
            localOnly={matchLocalOnly}
            localLowResults={matchLocalLowResults}
            onSelect={handleSelectMatch}
            onSkip={handleSkipMatch}
            onViewDetails={(match) => {
              setDetailMatch(match);
              setDrawerOpen(true);
            }}
          />
        )}

        {!loading && step === "campaign" && campaign && (
          <CampaignSummary campaign={campaign} onSave={handleCampaignSave} />
        )}

        {!loading && step === "outreach" && (
          <OutreachEditor
            outreaches={outreaches}
            onUpdateMessage={handleUpdateOutreachMessage}
            onSend={handleSendOutreaches}
            isSending={loading}
          />
        )}
      </div>

      {/* Navigation buttons */}
      {!loading && step !== "outreach" && (
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={stepIndex === 0}
            className="cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            {t("quickCollab.back")}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="cursor-pointer"
          >
            {step === "timing" ? (
              <>
                {t("quickCollab.findCreators")}
                <ArrowRight className="size-3.5" />
              </>
            ) : (
              <>
                {t("quickCollab.next")}
                <ArrowRight className="size-3.5" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Creator detail drawer */}
      <CreatorDetailDrawer
        match={detailMatch}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        isSelected={
          detailMatch ? matchStatuses[detailMatch.matchId] === "selected" : false
        }
        onSelect={() => {
          if (detailMatch) handleSelectMatch(detailMatch.matchId);
        }}
        onSkip={() => {
          if (detailMatch) handleSkipMatch(detailMatch.matchId);
        }}
      />
    </PageContainer>
  );
}
