"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PRIORITIES = [
  { value: "reach", label: "Reach", description: "Maximize how many people see your campaign" },
  { value: "engagement", label: "Engagement", description: "Get more likes, comments, and shares" },
  { value: "affordability", label: "Affordability", description: "Get the most value for your budget" },
  { value: "niche_relevance", label: "Niche Relevance", description: "Target the most relevant audience" },
] as const;

const CREATOR_SIZES = [
  { value: "nano", label: "Nano", description: "1K – 10K followers" },
  { value: "micro", label: "Micro", description: "10K – 50K followers" },
  { value: "mid", label: "Mid-tier", description: "50K – 500K followers" },
  { value: "macro", label: "Macro", description: "500K – 1M followers" },
  { value: "mega", label: "Mega", description: "1M+ followers" },
  { value: "any", label: "Any size", description: "No preference" },
] as const;

const CONTENT_STYLES = [
  "Polished / Professional",
  "Casual / Authentic",
  "Funny / Entertaining",
  "Educational / Informative",
  "Aesthetic / Lifestyle",
  "Review / Unboxing",
];

interface StepMatchmakingPrefsProps {
  audienceDescription: string;
  priority: string;
  contentStyle: string;
  creatorSize: string;
  onAudienceDescriptionChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onContentStyleChange: (value: string) => void;
  onCreatorSizeChange: (value: string) => void;
}

export function StepMatchmakingPrefs({
  audienceDescription,
  priority,
  contentStyle,
  creatorSize,
  onAudienceDescriptionChange,
  onPriorityChange,
  onContentStyleChange,
  onCreatorSizeChange,
}: StepMatchmakingPrefsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Matchmaking Preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Help us find the best creators for your campaign.
        </p>
      </div>

      {/* Audience */}
      <div className="space-y-2">
        <Label htmlFor="audience-desc">
          What audience are you trying to reach? (optional)
        </Label>
        <Textarea
          id="audience-desc"
          value={audienceDescription}
          onChange={(e) => onAudienceDescriptionChange(e.target.value)}
          placeholder="e.g. Young professionals aged 25-34 interested in fitness and wellness"
          rows={2}
          maxLength={500}
        />
      </div>

      {/* Priority */}
      <div className="space-y-3">
        <Label>What matters most? (optional)</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() =>
                onPriorityChange(priority === p.value ? "" : p.value)
              }
              className={cn(
                "flex cursor-pointer flex-col rounded-lg border px-4 py-3 text-left transition-colors",
                priority === p.value
                  ? "border-primary bg-primary/5"
                  : "border-input hover:border-primary/30",
              )}
            >
              <span className="text-sm font-medium">{p.label}</span>
              <span className="text-xs text-muted-foreground">
                {p.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Style */}
      <div className="space-y-3">
        <Label>Preferred content style (optional)</Label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() =>
                onContentStyleChange(contentStyle === style ? "" : style)
              }
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors",
                contentStyle === style
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input text-muted-foreground hover:border-primary/30",
              )}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Creator Size */}
      <div className="space-y-3">
        <Label>What creator size are you targeting? (optional)</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CREATOR_SIZES.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() =>
                onCreatorSizeChange(
                  creatorSize === size.value ? "" : size.value,
                )
              }
              className={cn(
                "flex cursor-pointer flex-col rounded-lg border px-3 py-2.5 text-left transition-colors",
                creatorSize === size.value
                  ? "border-primary bg-primary/5"
                  : "border-input hover:border-primary/30",
              )}
            >
              <span className="text-sm font-medium">{size.label}</span>
              <span className="text-xs text-muted-foreground">
                {size.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
