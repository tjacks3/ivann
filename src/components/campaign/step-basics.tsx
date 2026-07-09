"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const CAMPAIGN_TYPES = [
  { value: "product_promotion", label: "Product Promotion", description: "Promote a specific product or service" },
  { value: "brand_awareness", label: "Brand Awareness", description: "Increase visibility and reach" },
  { value: "restaurant_promotion", label: "Restaurant Promotion", description: "Drive foot traffic and reviews" },
  { value: "event_marketing", label: "Event Marketing", description: "Promote an event or experience" },
  { value: "ugc", label: "UGC", description: "User-generated content for your brand" },
  { value: "giveaway", label: "Giveaway", description: "Contest or giveaway campaign" },
  { value: "launch", label: "Launch", description: "Product or brand launch campaign" },
  { value: "ongoing_partnership", label: "Ongoing Partnership", description: "Long-term creator relationship" },
] as const;

interface StepBasicsProps {
  name: string;
  description: string;
  goal: string;
  campaignType: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onGoalChange: (value: string) => void;
  onCampaignTypeChange: (value: string) => void;
}

export function StepBasics({
  name,
  description,
  goal,
  campaignType,
  onNameChange,
  onDescriptionChange,
  onGoalChange,
  onCampaignTypeChange,
}: StepBasicsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Campaign Basics</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Give your campaign a name and tell us what you&rsquo;re looking to achieve.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="campaign-name">Campaign Name</Label>
          <Input
            id="campaign-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Summer Product Launch"
            maxLength={255}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign-goal">Campaign Goal</Label>
          <Textarea
            id="campaign-goal"
            value={goal}
            onChange={(e) => onGoalChange(e.target.value)}
            placeholder="What do you want to achieve? e.g. Drive awareness for our new product line"
            rows={2}
            maxLength={500}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign-description">Description (optional)</Label>
          <Textarea
            id="campaign-description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Additional details about the campaign..."
            rows={3}
            maxLength={2000}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Campaign Type</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CAMPAIGN_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => onCampaignTypeChange(type.value)}
              className={cn(
                "flex cursor-pointer flex-col rounded-lg border px-4 py-3 text-left transition-colors",
                campaignType === type.value
                  ? "border-primary bg-primary/5"
                  : "border-input hover:border-primary/30",
              )}
            >
              <span className="text-sm font-medium">{type.label}</span>
              <span className="text-xs text-muted-foreground">
                {type.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
