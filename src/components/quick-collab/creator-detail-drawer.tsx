"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Users, X, Check } from "lucide-react";
import { getPlatformMeta } from "@/lib/social/platforms";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import type { MatchedCreator } from "@/app/(app)/brand/quick-deal/actions";

const FIT_LABEL_COLORS: Record<string, string> = {
  "Strong niche match": "bg-purple-500/10 text-purple-600 border-purple-500/30",
  "Good budget fit": "bg-blue-500/10 text-blue-600 border-blue-500/30",
  "Great local fit": "bg-primary/10 text-primary border-primary/30",
  "Potential match": "bg-amber-500/10 text-amber-600 border-amber-500/30",
};

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

interface CreatorDetailDrawerProps {
  match: MatchedCreator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSelected: boolean;
  onSelect: () => void;
  onSkip: () => void;
}

export function CreatorDetailDrawer({
  match,
  open,
  onOpenChange,
  isSelected,
  onSelect,
  onSkip,
}: CreatorDetailDrawerProps) {
  const { t } = useTranslation();

  if (!match) return null;

  const initials = (match.fullName || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden p-0 sm:max-w-md"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <SheetTitle className="text-base font-semibold">
            {t("quickCollab.match.creatorDetails")}
          </SheetTitle>
          <SheetClose>
            <X className="size-5" />
          </SheetClose>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Profile header */}
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {match.avatarUrl && (
                <AvatarImage src={match.avatarUrl} alt={match.fullName || ""} />
              )}
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold">{match.fullName}</h3>
              <p className="text-sm text-muted-foreground">@{match.username}</p>
              {match.location && (
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {match.location}
                </div>
              )}
            </div>
          </div>

          {/* Fit label + score */}
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium",
                FIT_LABEL_COLORS[match.fitLabel] ?? FIT_LABEL_COLORS["Potential match"],
              )}
            >
              {match.fitLabel}
            </span>
            <span className="text-sm text-muted-foreground">
              {match.matchScore}% {t("quickCollab.match.score")}
            </span>
          </div>

          {/* Bio */}
          {match.bio && (
            <div>
              <h4 className="text-sm font-medium">{t("quickCollab.detail.about")}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{match.bio}</p>
            </div>
          )}

          {/* Categories */}
          {match.categories.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">{t("quickCollab.detail.categories")}</h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {match.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full border border-primary bg-white px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {t(`onboarding.category.${cat}`)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social accounts */}
          {match.socialAccounts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">{t("quickCollab.detail.platforms")}</h4>
              <div className="mt-2 space-y-2">
                {match.socialAccounts.map((sa) => {
                  const meta = getPlatformMeta(sa.platform);
                  const Icon = meta.icon;
                  return (
                    <div
                      key={sa.platform}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          className="size-4"
                          style={{ color: meta.color }}
                        />
                        <span className="text-sm font-medium">{meta.name}</span>
                        {sa.handle && (
                          <span className="text-sm text-muted-foreground">
                            @{sa.handle}
                          </span>
                        )}
                      </div>
                      {sa.followerCount != null && (
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="size-3.5 text-muted-foreground" />
                          <span className="font-medium">
                            {formatCount(sa.followerCount)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Why recommended */}
          {match.fitReasons.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">{t("quickCollab.detail.whyRecommended")}</h4>
              <ul className="mt-2 space-y-1">
                {match.fitReasons.map((reason) => (
                  <li
                    key={reason}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="size-3.5 shrink-0 text-primary" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Budget compatibility */}
          <div>
            <h4 className="text-sm font-medium">{t("quickCollab.detail.budgetFit")}</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {match.estimatedBudgetFit
                ? t("quickCollab.detail.budgetFitYes")
                : t("quickCollab.detail.budgetFitPartial")}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 border-t p-4">
          {isSelected ? (
            <Button
              variant="outline"
              className="w-full cursor-pointer"
              onClick={() => {
                onSkip();
                onOpenChange(false);
              }}
            >
              <X className="size-3.5" />
              {t("quickCollab.match.deselect")}
            </Button>
          ) : (
            <Button
              className="w-full cursor-pointer"
              onClick={() => {
                onSelect();
                onOpenChange(false);
              }}
            >
              <Check className="size-3.5" />
              {t("quickCollab.match.selectCreator")}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
