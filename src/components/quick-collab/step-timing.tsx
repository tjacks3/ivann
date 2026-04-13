"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

const TIMING_OPTIONS = ["asap", "this_week", "this_month", "flexible"] as const;

interface StepTimingProps {
  timing: string;
  notes: string;
  onTimingChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

export function StepTiming({
  timing,
  notes,
  onTimingChange,
  onNotesChange,
}: StepTimingProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{t("quickCollab.timing.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("quickCollab.timing.subtitle")}
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {TIMING_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onTimingChange(option)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors",
                timing === option
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              <Clock className="size-3.5 shrink-0" />
              <span className="text-sm font-medium">
                {t(`quickCollab.timingOption.${option}`)}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">
            {t("quickCollab.timing.notes")}{" "}
            <span className="text-muted-foreground">({t("quickCollab.location.optional")})</span>
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={t("quickCollab.timing.notesPlaceholder")}
            className="min-h-20"
            maxLength={1000}
          />
        </div>
      </div>
    </div>
  );
}
