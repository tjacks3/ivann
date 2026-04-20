"use client";

import { useState } from "react";
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
import { submitBrief } from "@/app/(app)/collaboration-workspace/actions";
import {
  briefSchema,
  type BriefValues,
} from "@/lib/validations/collaboration-workspace";
import { Loader2, X } from "lucide-react";

interface BrandBriefFormProps {
  collaborationId: string;
  existingBrief?: BriefValues | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BrandBriefForm({
  collaborationId,
  existingBrief,
  open,
  onOpenChange,
  onSuccess,
}: BrandBriefFormProps) {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BriefValues>({
    resolver: zodResolver(briefSchema),
    defaultValues: {
      campaignGoal: existingBrief?.campaignGoal ?? "",
      productOrService: existingBrief?.productOrService ?? "",
      requiredMentions: existingBrief?.requiredMentions ?? "",
      tagsHashtags: existingBrief?.tagsHashtags ?? "",
      location: existingBrief?.location ?? "",
      postingWindowStart: existingBrief?.postingWindowStart ?? "",
      postingWindowEnd: existingBrief?.postingWindowEnd ?? "",
      specialInstructions: existingBrief?.specialInstructions ?? "",
      restrictions: existingBrief?.restrictions ?? "",
    },
  });

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
          <SheetTitle className="text-base font-semibold">
            Campaign Brief
          </SheetTitle>
          <SheetClose>
            <X className="size-5" />
          </SheetClose>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
