"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Eye } from "lucide-react";
import { getPlatformMeta } from "@/lib/social/platforms";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import type { MatchedCreator } from "@/app/(app)/brand/quick-deal/actions";

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

const FIT_LABEL_COLORS: Record<string, string> = {
  "Strong niche match": "bg-purple-500/10 text-purple-600 border-purple-500/30",
  "Good budget fit": "bg-blue-500/10 text-blue-600 border-blue-500/30",
  "Great local fit": "bg-primary/10 text-primary border-primary/30",
  "Potential match": "bg-amber-500/10 text-amber-600 border-amber-500/30",
};

interface CreatorMatchCardProps {
  match: MatchedCreator;
  status: "recommended" | "selected" | "skipped";
  onSelect: () => void;
  onSkip: () => void;
  onViewDetails: () => void;
}

export function CreatorMatchCard({
  match,
  status,
  onSelect,
  onSkip,
  onViewDetails,
}: CreatorMatchCardProps) {
  const { t } = useTranslation();

  const initials = (match.fullName || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const displayCategories = match.categories?.slice(0, 3) ?? [];

  const handleCardClick = () => {
    if (status === "selected") {
      onSkip();
    } else {
      onSelect();
    }
  };

  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-all hover:shadow-md",
        status === "selected" && "ring-2 ring-primary",
        status === "skipped" && "opacity-50",
      )}
      onClick={handleCardClick}
    >
      <CardContent className="space-y-3.5 p-5">
        {/* Fit label */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-medium",
              FIT_LABEL_COLORS[match.fitLabel] ?? FIT_LABEL_COLORS["Potential match"],
            )}
          >
            {match.fitLabel}
          </span>
          <span className="text-xs text-muted-foreground">
            {match.matchScore}% {t("quickCollab.match.score")}
          </span>
        </div>

        {/* Header: avatar + name */}
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            {match.avatarUrl && (
              <AvatarImage src={match.avatarUrl} alt={match.fullName || ""} />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{match.fullName}</p>
            <p className="truncate text-sm text-muted-foreground">
              @{match.username}
            </p>
          </div>
        </div>

        {/* Bio */}
        {match.bio && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {match.bio}
          </p>
        )}

        {/* Categories */}
        {displayCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {displayCategories.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-primary bg-white px-2 py-0.5 text-xs font-medium text-primary"
              >
                {t(`onboarding.category.${cat}`)}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Users className="size-3.5" />
              <span className="font-semibold text-foreground">
                {formatCount(match.totalFollowers)}
              </span>
            </div>
            {match.location && (
              <div className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                <span className="max-w-[140px] truncate">{match.location}</span>
              </div>
            )}
          </div>

          {match.socialAccounts.length > 0 && (
            <div className="flex items-center gap-1.5">
              {match.socialAccounts.map((sa) => {
                const meta = getPlatformMeta(sa.platform);
                const Icon = meta.icon;
                return (
                  <Icon
                    key={sa.platform}
                    className="size-3.5"
                    style={{ color: meta.color }}
                    title={meta.name}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Fit reasons */}
        {match.fitReasons.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {match.fitReasons.slice(0, 2).map((reason) => (
              <span
                key={reason}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {reason}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="pt-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="w-full cursor-pointer"
          >
            <Eye className="size-3.5" />
            {t("quickCollab.match.viewDetails")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
