"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

import { creatorProfileSchema, brandProfileSchema } from "@/lib/validations/onboarding";
import type { CreatorProfileValues, BrandProfileValues } from "@/lib/validations/onboarding";

import { Stepper } from "@/components/onboarding/stepper";
import { RoleStep } from "@/components/onboarding/role-step";
import { CreatorProfileStep } from "@/components/onboarding/creator-profile-step";
import { CreatorImageStep } from "@/components/onboarding/creator-image-step";
import { CreatorSocialStep } from "@/components/onboarding/creator-social-step";
import { CreatorReviewStep } from "@/components/onboarding/creator-review-step";
import { BrandProfileStep } from "@/components/onboarding/brand-profile-step";
import { BrandReviewStep } from "@/components/onboarding/brand-review-step";
import { LoadingState } from "@/components/shared/loading-state";

import { loadDraft, saveDraft, completeOnboarding } from "./actions";

interface FormData {
  role?: UserRole;
  fullName?: string;
  username?: string;
  bio?: string;
  categories?: string[];
  location?: string;
  brandName?: string;
  contactName?: string;
  companyWebsite?: string;
  industry?: string;
}

const CREATOR_STEPS = [
  { label: "Role" },
  { label: "Profile" },
  { label: "Photo" },
  { label: "Socials" },
  { label: "Review" },
];

const BRAND_STEPS = [
  { label: "Role" },
  { label: "Company" },
  { label: "Review" },
];

export default function OnboardingPage() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const role = formData.role;
  const steps = role === "brand" ? BRAND_STEPS : CREATOR_STEPS;

  // Creator profile form
  const creatorForm = useForm<CreatorProfileValues>({
    resolver: zodResolver(creatorProfileSchema),
    defaultValues: {
      fullName: "",
      username: "",
      bio: "",
      categories: [],
      location: "",
    },
  });

  // Brand profile form
  const brandForm = useForm<BrandProfileValues>({
    resolver: zodResolver(brandProfileSchema),
    defaultValues: {
      brandName: "",
      contactName: "",
      companyWebsite: "",
      bio: "",
      industry: "",
    },
  });

  // Load draft on mount
  useEffect(() => {
    loadDraft().then((draft) => {
      if (draft && !draft.onboardingCompleted) {
        const restored: FormData = {
          role: draft.role as UserRole,
          fullName: draft.fullName ?? undefined,
          username: draft.username ?? undefined,
          bio: draft.bio ?? undefined,
          categories: draft.categories ?? undefined,
          location: draft.location ?? undefined,
          brandName: draft.brandName ?? undefined,
          contactName: draft.contactName ?? undefined,
          companyWebsite: draft.companyWebsite ?? undefined,
          industry: draft.industry ?? undefined,
        };
        setFormData(restored);
        setCurrentStep(draft.onboardingStep);

        // Restore form values
        if (draft.role === "creator") {
          creatorForm.reset({
            fullName: draft.fullName ?? "",
            username: draft.username ?? "",
            bio: draft.bio ?? "",
            categories: draft.categories ?? [],
            location: draft.location ?? "",
          });
        } else if (draft.role === "brand") {
          brandForm.reset({
            brandName: draft.brandName ?? "",
            contactName: draft.contactName ?? "",
            companyWebsite: draft.companyWebsite ?? "",
            bio: draft.bio ?? "",
            industry: draft.industry ?? "",
          });
        }
      }
      setDraftLoaded(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoleSelect = (selectedRole: UserRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  const trySaveDraft = async (data: Parameters<typeof saveDraft>[0]) => {
    try {
      setError(null);
      await saveDraft(data);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "EMAIL_EXISTS") {
        setError(t("auth.error.emailTakenAction"));
      } else if (msg === "USERNAME_EXISTS") {
        setError(t("auth.error.usernameTaken"));
      } else {
        setError(t("auth.error.generic"));
      }
      return false;
    }
  };

  const handleNext = async () => {
    // Step 0: Role selection
    if (currentStep === 0) {
      if (!formData.role) return;
      const ok = await trySaveDraft({ role: formData.role, onboardingStep: 1 });
      if (ok) setCurrentStep(1);
      return;
    }

    // Creator step 1: profile form
    if (role === "creator" && currentStep === 1) {
      const valid = await creatorForm.trigger();
      if (!valid) return;
      const values = creatorForm.getValues();
      const updated = { ...formData, ...values };
      setFormData(updated);
      const ok = await trySaveDraft({ ...values, onboardingStep: 2 });
      if (ok) setCurrentStep(2);
      return;
    }

    // Creator steps 2 (image) and 3 (social): no validation, just advance
    if (role === "creator" && (currentStep === 2 || currentStep === 3)) {
      const ok = await trySaveDraft({ onboardingStep: currentStep + 1 });
      if (ok) setCurrentStep(currentStep + 1);
      return;
    }

    // Brand step 1: profile form
    if (role === "brand" && currentStep === 1) {
      const valid = await brandForm.trigger();
      if (!valid) return;
      const values = brandForm.getValues();
      const updated = { ...formData, ...values };
      setFormData(updated);
      const ok = await trySaveDraft({ ...values, onboardingStep: 2 });
      if (ok) setCurrentStep(2);
      return;
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!formData.role) return;
    startTransition(() => completeOnboarding({ ...formData, role: formData.role! } as Parameters<typeof completeOnboarding>[0]));
  };

  const isLastStep = currentStep === steps.length - 1;

  if (!draftLoaded) {
    return <LoadingState variant="page" />;
  }

  return (
    <div className="space-y-6">
      {/* Stepper — show after role selection */}
      {role && <Stepper steps={steps} currentStep={currentStep} />}

      {/* Error display */}
      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p>{error}</p>
          {error === t("auth.error.emailTakenAction") && (
            <div className="mt-2 flex gap-3 text-xs">
              <Link href="/login" className="font-medium underline">
                {t("nav.signIn")}
              </Link>
              <Link href="/forgot-password" className="font-medium underline">
                {t("auth.signIn.forgotPassword")}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Step content */}
      {currentStep === 0 && (
        <RoleStep selectedRole={formData.role ?? null} onSelectRole={handleRoleSelect} />
      )}

      {role === "creator" && currentStep === 1 && (
        <CreatorProfileStep form={creatorForm} />
      )}
      {role === "creator" && currentStep === 2 && (
        <CreatorImageStep name={formData.fullName} />
      )}
      {role === "creator" && currentStep === 3 && (
        <CreatorSocialStep />
      )}
      {role === "creator" && currentStep === 4 && (
        <CreatorReviewStep data={formData} onEditStep={setCurrentStep} />
      )}

      {role === "brand" && currentStep === 1 && (
        <BrandProfileStep form={brandForm} />
      )}
      {role === "brand" && currentStep === 2 && (
        <BrandReviewStep data={formData} onEditStep={setCurrentStep} />
      )}

      {/* Navigation buttons */}
      <div className={cn("flex gap-3", currentStep === 0 ? "" : "justify-between")}>
        {currentStep > 0 && (
          <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
            {t("onboarding.back")}
          </Button>
        )}

        {isLastStep ? (
          <Button
            type="button"
            className="flex-1"
            disabled={isPending}
            onClick={handleSubmit}
          >
            {isPending && <Loader2 className="animate-spin" />}
            {t("onboarding.submit")}
          </Button>
        ) : (
          <Button
            type="button"
            className={cn(currentStep === 0 ? "w-full" : "flex-1")}
            disabled={currentStep === 0 && !formData.role}
            onClick={handleNext}
          >
            {t(currentStep === 0 ? "onboarding.continue" : "onboarding.next")}
          </Button>
        )}
      </div>
    </div>
  );
}
