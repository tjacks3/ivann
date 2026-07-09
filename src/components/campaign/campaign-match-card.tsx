"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserPlus, Eye, Check, X, MapPin, Star } from "lucide-react";

interface CampaignMatchCardProps {
  creator: {
    id: string;
    fullName: string | null;
    username: string | null;
    avatarUrl: string | null;
    categories: string[] | null;
    location: string | null;
  };
  matchScore: number;
  fitLabel: string;
  fitReasons: string[];
  estimatedReach: number | null;
  estimatedPriceRange: string | null;
  audienceAgeFit: boolean | null;
  locationFit: boolean | null;
  platformFit: boolean | null;
  status: string;
  source: string;
  onAdd: () => void;
  onSkip: () => void;
  onViewProfile: () => void;
}

export function CampaignMatchCard({
  creator,
  matchScore,
  fitLabel,
  fitReasons,
  estimatedReach,
  estimatedPriceRange,
  audienceAgeFit,
  locationFit,
  platformFit,
  status,
  source,
  onAdd,
  onSkip,
  onViewProfile,
}: CampaignMatchCardProps) {
  const isAdded = status === "added" || status === "selected";
  const isSkipped = status === "skipped";

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        isAdded && "border-primary bg-primary/5",
        isSkipped && "opacity-50",
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar className="size-12 shrink-0">
          {creator.avatarUrl ? (
            <img
              src={creator.avatarUrl}
              alt={creator.fullName ?? ""}
              className="size-full rounded-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center rounded-full bg-muted text-sm font-medium">
              {(creator.fullName ?? "?")[0]}
            </div>
          )}
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold">
              {creator.fullName ?? creator.username ?? "Creator"}
            </h3>
            {source === "manual" && (
              <Badge variant="secondary" className="text-xs">
                Manual
              </Badge>
            )}
          </div>
          {creator.username && (
            <p className="text-xs text-muted-foreground">
              @{creator.username}
            </p>
          )}
          {creator.location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {creator.location}
            </p>
          )}
        </div>
        {matchScore > 0 && (
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-full text-sm font-bold",
                matchScore >= 70
                  ? "bg-primary/15 text-primary"
                  : matchScore >= 50
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {matchScore}
            </div>
            <span className="mt-0.5 text-[10px] text-muted-foreground">
              score
            </span>
          </div>
        )}
      </div>

      {/* Fit Label & Reasons */}
      <div className="mt-3">
        <Badge variant="outline" className="mb-2 text-xs">
          <Star className="mr-1 size-3" />
          {fitLabel}
        </Badge>
        <div className="flex flex-wrap gap-1">
          {fitReasons.slice(0, 3).map((reason, i) => (
            <span
              key={i}
              className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {reason}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-md bg-muted/50 px-2 py-1.5">
          <p className="font-medium">
            {estimatedReach
              ? estimatedReach >= 1000
                ? `${(estimatedReach / 1000).toFixed(1)}K`
                : estimatedReach
              : "—"}
          </p>
          <p className="text-muted-foreground">Est. Reach</p>
        </div>
        <div className="rounded-md bg-muted/50 px-2 py-1.5">
          <p className="font-medium">{estimatedPriceRange ?? "—"}</p>
          <p className="text-muted-foreground">Price Range</p>
        </div>
        <div className="rounded-md bg-muted/50 px-2 py-1.5">
          <div className="flex items-center justify-center gap-1">
            {platformFit && (
              <Check className="size-3 text-primary" />
            )}
            {locationFit && (
              <MapPin className="size-3 text-primary" />
            )}
            {audienceAgeFit && (
              <Star className="size-3 text-primary" />
            )}
            {!platformFit && !locationFit && !audienceAgeFit && (
              <span className="font-medium">—</span>
            )}
          </div>
          <p className="text-muted-foreground">Fit</p>
        </div>
      </div>

      {/* Categories */}
      {creator.categories && creator.categories.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {creator.categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] capitalize text-primary"
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        {isAdded ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onSkip}
            className="flex-1 cursor-pointer text-xs"
          >
            <X className="size-3" />
            Remove
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onAdd}
            className="flex-1 cursor-pointer text-xs"
          >
            <UserPlus className="size-3" />
            Add to Campaign
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewProfile}
          className="cursor-pointer text-xs"
        >
          <Eye className="size-3" />
          View Profile
        </Button>
      </div>
    </div>
  );
}
