"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { CampaignWizardStepper } from "@/components/campaign/campaign-wizard-stepper";
import { StepBasics } from "@/components/campaign/step-basics";
import { StepAudience } from "@/components/campaign/step-audience";
import { StepBudgetTimeline } from "@/components/campaign/step-budget-timeline";
import { StepPlatforms } from "@/components/campaign/step-platforms";
import { StepMatchmakingPrefs } from "@/components/campaign/step-matchmaking-prefs";
import { createCampaign } from "@/app/(app)/brand/campaigns/actions";
import {
  ArrowLeft,
  ArrowRight,
  Target,
  Users,
  DollarSign,
  Layers,
  Sparkles,
} from "lucide-react";

type WizardStep =
  | "intro"
  | "basics"
  | "audience"
  | "budget_timeline"
  | "platforms"
  | "matchmaking_prefs";

const ALL_STEPS: WizardStep[] = [
  "intro",
  "basics",
  "audience",
  "budget_timeline",
  "platforms",
  "matchmaking_prefs",
];

const STEP_LABELS: Record<WizardStep, string> = {
  intro: "Welcome",
  basics: "Campaign Basics",
  audience: "Target Audience",
  budget_timeline: "Budget & Timeline",
  platforms: "Platforms & Niche",
  matchmaking_prefs: "Matchmaking Preferences",
};

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("intro");
  const [loading, setLoading] = useState(false);

  // Step: Basics
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [campaignType, setCampaignType] = useState("");

  // Step: Audience
  const [targetAgeGroups, setTargetAgeGroups] = useState<string[]>([]);
  const [targetLocations, setTargetLocations] = useState<
    { city: string; state: string }[]
  >([]);

  // Step: Budget & Timeline
  const [totalBudget, setTotalBudget] = useState("");
  const [reachGoal, setReachGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Step: Platforms
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [category, setCategory] = useState("");

  // Step: Matchmaking Prefs
  const [audienceDescription, setAudienceDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [contentStyle, setContentStyle] = useState("");
  const [creatorSize, setCreatorSize] = useState("");

  const stepIndex = ALL_STEPS.indexOf(step);

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case "intro":
        return true;
      case "basics":
        return name.trim() !== "" && campaignType !== "";
      case "audience":
        return true; // all optional
      case "budget_timeline":
        return totalBudget !== "" && Number(totalBudget) > 0;
      case "platforms":
        return platforms.length > 0;
      case "matchmaking_prefs":
        return true; // all optional
      default:
        return true;
    }
  }, [step, name, campaignType, totalBudget, platforms]);

  const handleNext = async () => {
    if (step === "matchmaking_prefs") {
      // Final step: create the campaign and redirect to match page
      setLoading(true);
      const budgetInCents = Math.round(Number(totalBudget) * 100);
      const result = await createCampaign({
        name: name.trim(),
        description: description.trim() || undefined,
        goal: goal.trim() || undefined,
        totalBudgetInCents: budgetInCents,
        reachGoal: reachGoal ? Number(reachGoal) : undefined,
        targetAgeGroups:
          targetAgeGroups.length > 0 ? targetAgeGroups : undefined,
        targetLocations:
          targetLocations.length > 0 ? targetLocations : undefined,
        campaignType: campaignType as CreateCampaignType,
        platforms,
        category: category || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setLoading(false);

      if (result.success) {
        router.push(`/brand/campaigns/${result.campaignId}/match`);
      }
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

  return (
    <PageContainer size="narrow">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/brand/campaigns"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-3.5" />
          Back to Campaigns
        </Link>
      </div>

      {/* Stepper */}
      {step !== "intro" && (
        <CampaignWizardStepper
          currentStep={stepIndex - 1}
          totalSteps={ALL_STEPS.length - 1}
          stepLabel={STEP_LABELS[step]}
        />
      )}

      {/* Step content */}
      <div className="mt-8">
        {loading && <LoadingState variant="spinner" />}

        {/* Intro */}
        {!loading && step === "intro" && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
                <Target className="size-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Create a Campaign</h1>
              <p className="mt-3 text-muted-foreground">
                Build a campaign, match with creators, allocate your budget, and
                manage every creator deal in one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <div className="flex items-start gap-2.5">
                <Users className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Smart Matching
                  </span>{" "}
                  &mdash; creators matched by niche, location &amp; budget
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <DollarSign className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Budget Control
                  </span>{" "}
                  &mdash; set a total budget and allocate per creator
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Layers className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    One Workspace
                  </span>{" "}
                  &mdash; manage all creator deals from a single campaign view
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Full Control
                  </span>{" "}
                  &mdash; briefs, timelines, payments, and revisions per creator
                </p>
              </div>
            </div>

            <div className="text-center">
              <Button
                size="lg"
                onClick={() => setStep("basics")}
                className="cursor-pointer px-8"
              >
                Get Started
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {!loading && step === "basics" && (
          <StepBasics
            name={name}
            description={description}
            goal={goal}
            campaignType={campaignType}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onGoalChange={setGoal}
            onCampaignTypeChange={setCampaignType}
          />
        )}

        {!loading && step === "audience" && (
          <StepAudience
            targetAgeGroups={targetAgeGroups}
            targetLocations={targetLocations}
            onTargetAgeGroupsChange={setTargetAgeGroups}
            onTargetLocationsChange={setTargetLocations}
          />
        )}

        {!loading && step === "budget_timeline" && (
          <StepBudgetTimeline
            totalBudget={totalBudget}
            reachGoal={reachGoal}
            startDate={startDate}
            endDate={endDate}
            onTotalBudgetChange={setTotalBudget}
            onReachGoalChange={setReachGoal}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        )}

        {!loading && step === "platforms" && (
          <StepPlatforms
            platforms={platforms}
            category={category}
            onPlatformsChange={setPlatforms}
            onCategoryChange={setCategory}
          />
        )}

        {!loading && step === "matchmaking_prefs" && (
          <StepMatchmakingPrefs
            audienceDescription={audienceDescription}
            priority={priority}
            contentStyle={contentStyle}
            creatorSize={creatorSize}
            onAudienceDescriptionChange={setAudienceDescription}
            onPriorityChange={setPriority}
            onContentStyleChange={setContentStyle}
            onCreatorSizeChange={setCreatorSize}
          />
        )}
      </div>

      {/* Navigation buttons */}
      {!loading && step !== "intro" && (
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={stepIndex === 0}
            className="cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="cursor-pointer"
          >
            {step === "matchmaking_prefs" ? (
              <>
                Create &amp; Find Creators
                <ArrowRight className="size-3.5" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="size-3.5" />
              </>
            )}
          </Button>
        </div>
      )}
    </PageContainer>
  );
}

// Type helper for campaign type enum
type CreateCampaignType =
  | "product_promotion"
  | "brand_awareness"
  | "restaurant_promotion"
  | "event_marketing"
  | "ugc"
  | "giveaway"
  | "launch"
  | "ongoing_partnership";
