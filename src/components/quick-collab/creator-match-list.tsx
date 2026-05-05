"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { CreatorMatchCard } from "./creator-match-card";
import { useTranslation } from "@/i18n";
import { SearchX, MapPin, Info } from "lucide-react";
import type { MatchedCreator } from "@/app/(app)/brand/quick-deal/actions";

interface CreatorMatchListProps {
  matches: MatchedCreator[];
  matchStatuses: Record<string, "recommended" | "selected" | "skipped">;
  localOnly?: boolean;
  localLowResults?: boolean;
  onSelect: (matchId: string) => void;
  onSkip: (matchId: string) => void;
  onViewDetails: (match: MatchedCreator) => void;
}

export function CreatorMatchList({
  matches,
  matchStatuses,
  localOnly,
  localLowResults,
  onSelect,
  onSkip,
  onViewDetails,
}: CreatorMatchListProps) {
  const { t } = useTranslation();

  // Empty state — different messaging for local-only vs global
  if (matches.length === 0) {
    if (localOnly) {
      return (
        <EmptyState
          icon={<MapPin className="size-6" />}
          title={t("quickCollab.match.localEmptyTitle")}
          description={t("quickCollab.match.localEmptyDescription")}
        />
      );
    }
    return (
      <EmptyState
        icon={<SearchX className="size-6" />}
        title={t("quickCollab.match.emptyTitle")}
        description={t("quickCollab.match.emptyDescription")}
      />
    );
  }

  const selectedCount = Object.values(matchStatuses).filter(
    (s) => s === "selected",
  ).length;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{t("quickCollab.match.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("quickCollab.match.subtitle", { count: matches.length })}
        </p>
        {selectedCount > 0 && (
          <p className="mt-1 text-sm font-medium text-primary">
            {t(selectedCount === 1 ? "quickCollab.match.selectedCountOne" : "quickCollab.match.selectedCountOther", { count: selectedCount })}
          </p>
        )}
      </div>

      {/* Local low-results banner */}
      {localOnly && localLowResults && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <Info className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-medium text-amber-700">
              {t("quickCollab.match.localLowResults")}
            </p>
            <p className="mt-0.5 text-amber-600/80">
              {t(matches.length === 1 ? "quickCollab.match.localLowDescriptionOne" : "quickCollab.match.localLowDescriptionOther", { count: matches.length })}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {matches.map((match) => (
          <CreatorMatchCard
            key={match.matchId}
            match={match}
            status={matchStatuses[match.matchId] ?? "recommended"}
            onSelect={() => onSelect(match.matchId)}
            onSkip={() => onSkip(match.matchId)}
            onViewDetails={() => onViewDetails(match)}
          />
        ))}
      </div>
    </div>
  );
}
