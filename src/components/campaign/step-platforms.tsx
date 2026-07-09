"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getPlatformMeta, PLATFORM_ORDER } from "@/lib/social/platforms";

const CREATOR_CATEGORIES = [
  "fashion",
  "tech",
  "lifestyle",
  "fitness",
  "food",
  "travel",
  "education",
  "entertainment",
  "business",
  "beauty",
  "gaming",
  "music",
  "health",
  "parenting",
  "sports",
  "finance",
];

interface StepPlatformsProps {
  platforms: string[];
  category: string;
  onPlatformsChange: (platforms: string[]) => void;
  onCategoryChange: (category: string) => void;
}

export function StepPlatforms({
  platforms,
  category,
  onPlatformsChange,
  onCategoryChange,
}: StepPlatformsProps) {
  const togglePlatform = (platform: string) => {
    if (platforms.includes(platform)) {
      onPlatformsChange(platforms.filter((p) => p !== platform));
    } else {
      onPlatformsChange([...platforms, platform]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Platforms &amp; Niche</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the platforms and creator niche that matter most for this
          campaign.
        </p>
      </div>

      {/* Platforms */}
      <div className="space-y-3">
        <Label>Preferred Platforms</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PLATFORM_ORDER.filter((p) => p !== "website").map((platform) => {
            const meta = getPlatformMeta(platform);
            const Icon = meta.icon;
            const isSelected = platforms.includes(platform);
            return (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/30",
                )}
              >
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"
                  style={{ color: meta.color }}
                >
                  <Icon className="size-4" />
                </div>
                <span className="text-sm font-medium">{meta.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-3">
        <Label>Creator Category / Niche (optional)</Label>
        <div className="flex flex-wrap gap-2">
          {CREATOR_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(category === cat ? "" : cat)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-sm capitalize transition-colors",
                category === cat
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input text-muted-foreground hover:border-primary/30",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
