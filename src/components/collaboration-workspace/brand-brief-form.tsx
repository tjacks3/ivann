"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  submitBrief,
  saveBriefDraft,
} from "@/app/(app)/collaboration-workspace/actions";
import {
  briefSchema,
  type BriefValues,
} from "@/lib/validations/collaboration-workspace";
import { Loader2, X, Check, FileText } from "lucide-react";

// ─── Brief Templates ──────────────────────────────────────────────────────

const BRIEF_TEMPLATES: {
  id: string;
  label: string;
  values: Partial<BriefValues>;
}[] = [
  {
    id: "product_review",
    label: "Product Review",
    values: {
      campaignGoal:
        "Create an authentic product review showcasing the key features and benefits of the product. The content should feel genuine and highlight your honest experience.",
      productOrService: "",
    },
  },
  {
    id: "brand_awareness",
    label: "Brand Awareness",
    values: {
      campaignGoal:
        "Increase brand awareness and reach by introducing the brand to your audience. Focus on the brand story, values, and what makes it unique.",
      specialInstructions:
        "Focus on storytelling and brand values rather than hard selling. Show how the brand fits naturally into your content style.",
    },
  },
  {
    id: "event_coverage",
    label: "Event Coverage",
    values: {
      campaignGoal:
        "Provide engaging coverage of the event, capturing key moments, the atmosphere, and highlighting the brand's presence. Create excitement and FOMO for your audience.",
      location: "",
      postingWindowStart: "",
      postingWindowEnd: "",
    },
  },
  {
    id: "one_time_post",
    label: "One-Time Post",
    values: {
      campaignGoal:
        "Create a single, high-quality post featuring the product or service. The content should be visually appealing and align with your usual aesthetic.",
    },
  },
];

// ─── Component ────────────────────────────────────────────────────────────

interface BrandBriefFormProps {
  collaborationId: string;
  existingBrief?: BriefValues | null;
  existingDraft?: Partial<BriefValues> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BrandBriefForm({
  collaborationId,
  existingBrief,
  existingDraft,
  open,
  onOpenChange,
  onSuccess,
}: BrandBriefFormProps) {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Use draft data if no submitted brief exists
  const initialValues = existingBrief ?? existingDraft ?? {};

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<BriefValues>({
    resolver: zodResolver(briefSchema),
    defaultValues: {
      campaignGoal: initialValues.campaignGoal ?? "",
      productOrService: initialValues.productOrService ?? "",
      requiredMentions: initialValues.requiredMentions ?? "",
      tagsHashtags: initialValues.tagsHashtags ?? "",
      location: initialValues.location ?? "",
      postingWindowStart: initialValues.postingWindowStart ?? "",
      postingWindowEnd: initialValues.postingWindowEnd ?? "",
      specialInstructions: initialValues.specialInstructions ?? "",
      restrictions: initialValues.restrictions ?? "",
    },
  });

  const formValues = watch();

  // Autosave draft every 5 seconds when form is dirty
  const saveDraft = useCallback(async () => {
    if (!existingBrief) {
      // Only save drafts if brief hasn't been submitted yet
      await saveBriefDraft(collaborationId, formValues);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }
  }, [collaborationId, formValues, existingBrief]);

  useEffect(() => {
    if (!isDirty || !open) return;

    if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
    }
    draftTimerRef.current = setTimeout(() => {
      saveDraft();
    }, 5000);

    return () => {
      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current);
      }
    };
  }, [formValues, isDirty, open, saveDraft]);

  const handleTemplateSelect = (templateId: string) => {
    const template = BRIEF_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    const entries = Object.entries(template.values) as [keyof BriefValues, string][];
    for (const [key, value] of entries) {
      if (value) {
        setValue(key, value, { shouldDirty: true });
      }
    }
  };

  const onSubmit = async (data: BriefValues) => {
    setSaving(true);
    setServerError("");
    const result = await submitBrief(collaborationId, data);
    if (result.success) {
      onOpenChange(false);
      onSuccess();
    } else {
      setServerError("Failed to submit brief. Please try again.");
    }
    setSaving(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-base font-semibold">
              Campaign Brief
            </SheetTitle>
            {draftSaved && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Check className="size-3" />
                Draft saved
              </span>
            )}
          </div>
          <SheetClose>
            <X className="size-5" />
          </SheetClose>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Template selector */}
            {!existingBrief && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <FileText className="size-3.5" />
                  Start from a template
                </Label>
                <Select onValueChange={(val: string | null) => val && handleTemplateSelect(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRIEF_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Campaign Goal */}
            <div className="space-y-1.5">
              <Label htmlFor="campaignGoal">Campaign Goal *</Label>
              <Textarea
                id="campaignGoal"
                placeholder="What is the main goal of this campaign?"
                {...register("campaignGoal")}
              />
              {errors.campaignGoal && (
                <p className="text-xs text-destructive">
                  {errors.campaignGoal.message}
                </p>
              )}
            </div>

            {/* Product/Service */}
            <div className="space-y-1.5">
              <Label htmlFor="productOrService">Product / Service *</Label>
              <Input
                id="productOrService"
                placeholder="What product or service should be highlighted?"
                {...register("productOrService")}
              />
              {errors.productOrService && (
                <p className="text-xs text-destructive">
                  {errors.productOrService.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Required Mentions */}
              <div className="space-y-1.5">
                <Label htmlFor="requiredMentions">Required Mentions</Label>
                <Textarea
                  id="requiredMentions"
                  placeholder="Specific phrases, handles, or links to include"
                  {...register("requiredMentions")}
                />
                {errors.requiredMentions && (
                  <p className="text-xs text-destructive">
                    {errors.requiredMentions.message}
                  </p>
                )}
              </div>

              {/* Tags/Hashtags */}
              <div className="space-y-1.5">
                <Label htmlFor="tagsHashtags">Tags / Hashtags</Label>
                <Input
                  id="tagsHashtags"
                  placeholder="#brand #campaign"
                  {...register("tagsHashtags")}
                />
                {errors.tagsHashtags && (
                  <p className="text-xs text-destructive">
                    {errors.tagsHashtags.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Location */}
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Specific location or setting"
                  {...register("location")}
                />
              </div>

              {/* Posting Window */}
              <div className="space-y-1.5">
                <Label>Posting Window</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    placeholder="Start"
                    {...register("postingWindowStart")}
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="date"
                    placeholder="End"
                    {...register("postingWindowEnd")}
                  />
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-1.5">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                placeholder="Any specific guidelines, tone, or style requirements"
                {...register("specialInstructions")}
              />
              {errors.specialInstructions && (
                <p className="text-xs text-destructive">
                  {errors.specialInstructions.message}
                </p>
              )}
            </div>

            {/* Restrictions */}
            <div className="space-y-1.5">
              <Label htmlFor="restrictions">Restrictions</Label>
              <Textarea
                id="restrictions"
                placeholder="Anything to avoid or content limitations"
                {...register("restrictions")}
              />
              {errors.restrictions && (
                <p className="text-xs text-destructive">
                  {errors.restrictions.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}
          </div>

          {/* Fixed footer */}
          <div className="shrink-0 border-t bg-background p-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 cursor-pointer"
              >
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                {existingBrief ? "Update Brief" : "Submit Brief"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
