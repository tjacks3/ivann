"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/i18n";
import { CalendarClock, Repeat, Info } from "lucide-react";

type Frequency = "weekly" | "biweekly" | "monthly";
type Duration = "1_month" | "2_months" | "3_months" | "custom";

interface OngoingPartnershipFieldsProps {
  onSummaryChange: (summary: string) => void;
  onDeliveryDaysChange: (days: number) => void;
  onDiscountedPriceChange: (cents: number | null) => void;
  basePriceInCents: number;
}

function getDurationWeeks(duration: Duration, customWeeks: number): number {
  if (duration === "1_month") return 4;
  if (duration === "2_months") return 8;
  if (duration === "3_months") return 12;
  return customWeeks;
}

function buildSummary(
  frequency: Frequency,
  duration: Duration,
  customWeeks: number,
  includeRecap: boolean,
  t: (key: string) => string,
): string {
  const weeks = getDurationWeeks(duration, customWeeks);
  const months = Math.max(1, Math.round(weeks / 4));

  let summary = "";
  if (frequency === "weekly") {
    summary = `${t("packages.ongoing.summaryWeekly")} ${weeks} ${t("packages.ongoing.weeks")}`;
  } else if (frequency === "biweekly") {
    summary = `${t("packages.ongoing.summaryBiweekly")} ${months} ${months === 1 ? t("packages.ongoing.month") : t("packages.ongoing.months")}`;
  } else {
    summary = `${t("packages.ongoing.summaryMonthly")} ${months} ${months === 1 ? t("packages.ongoing.month") : t("packages.ongoing.months")}`;
  }

  if (includeRecap) {
    summary += ` + ${t("packages.ongoing.monthlyRecap")}`;
  }

  return summary;
}

export function OngoingPartnershipFields({
  onSummaryChange,
  onDeliveryDaysChange,
  onDiscountedPriceChange,
  basePriceInCents,
}: OngoingPartnershipFieldsProps) {
  const { t } = useTranslation();
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [duration, setDuration] = useState<Duration>("2_months");
  const [customWeeks, setCustomWeeks] = useState(8);
  const [includeRecap, setIncludeRecap] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Store callbacks in refs to avoid re-triggering the effect
  const onSummaryRef = useRef(onSummaryChange);
  const onDeliveryRef = useRef(onDeliveryDaysChange);
  const onDiscountRef = useRef(onDiscountedPriceChange);
  onSummaryRef.current = onSummaryChange;
  onDeliveryRef.current = onDeliveryDaysChange;
  onDiscountRef.current = onDiscountedPriceChange;

  // Capture the original base price once — don't let discount recalculation feed back
  const basePriceRef = useRef(basePriceInCents);

  // Sync to parent only when local state changes
  useEffect(() => {
    onSummaryRef.current(buildSummary(frequency, duration, customWeeks, includeRecap, t));
    onDeliveryRef.current(getDurationWeeks(duration, customWeeks) * 7);

    if (discountPercent > 0 && basePriceRef.current > 0) {
      onDiscountRef.current(Math.round(basePriceRef.current * (1 - discountPercent / 100)));
    } else {
      onDiscountRef.current(null);
    }
  }, [frequency, duration, customWeeks, includeRecap, discountPercent, t]);

  const summary = buildSummary(frequency, duration, customWeeks, includeRecap, t);

  return (
    <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CalendarClock className="size-4 text-foreground" />
        <p className="text-sm font-semibold text-foreground">
          {t("packages.ongoing.title")}
        </p>
      </div>

      {/* Value messaging */}
      <div className="flex items-start gap-2 rounded-md bg-primary/5 px-3 py-2">
        <Info className="mt-0.5 size-3.5 shrink-0 text-foreground" />
        <p className="text-xs text-foreground">
          {t("packages.ongoing.valueTip")}
        </p>
      </div>

      {/* Frequency + Duration */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">{t("packages.ongoing.frequency")}</Label>
          <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">{t("packages.ongoing.freq.weekly")}</SelectItem>
              <SelectItem value="biweekly">{t("packages.ongoing.freq.biweekly")}</SelectItem>
              <SelectItem value="monthly">{t("packages.ongoing.freq.monthly")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">{t("packages.ongoing.duration")}</Label>
          <Select value={duration} onValueChange={(v) => setDuration(v as Duration)}>
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1_month">{t("packages.ongoing.dur.1month")}</SelectItem>
              <SelectItem value="2_months">{t("packages.ongoing.dur.2months")}</SelectItem>
              <SelectItem value="3_months">{t("packages.ongoing.dur.3months")}</SelectItem>
              <SelectItem value="custom">{t("packages.ongoing.dur.custom")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Custom weeks */}
      {duration === "custom" && (
        <div className="space-y-1.5">
          <Label className="text-xs">{t("packages.ongoing.customWeeks")}</Label>
          <Input
            type="number"
            min={1}
            max={52}
            value={customWeeks}
            onChange={(e) => setCustomWeeks(parseInt(e.target.value, 10) || 1)}
            className="max-w-32"
          />
        </div>
      )}

      {/* Monthly recap checkbox */}
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={includeRecap}
          onChange={(e) => setIncludeRecap(e.target.checked)}
          className="size-4 rounded border-input accent-primary"
        />
        <span className="text-sm">{t("packages.ongoing.includeRecap")}</span>
      </label>

      {/* Bundle discount */}
      <div className="space-y-1.5">
        <Label className="text-xs">{t("packages.ongoing.discount")}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={50}
            value={discountPercent || ""}
            onChange={(e) => setDiscountPercent(parseInt(e.target.value, 10) || 0)}
            placeholder="0"
            className="max-w-20 bg-white"
          />
          <span className="text-sm text-muted-foreground">%</span>
          {discountPercent > 0 && (
            <span className="text-xs font-medium text-primary">
              {t("packages.ongoing.savingLabel")}
            </span>
          )}
        </div>
      </div>

      {/* Summary preview */}
      <div className="rounded-md bg-primary/5 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <Repeat className="size-3.5 text-foreground" />
          <p className="text-sm font-medium text-foreground">{summary}</p>
        </div>
        <p className="mt-1 text-xs text-foreground">
          {t("packages.ongoing.summaryHint")}
        </p>
      </div>
    </div>
  );
}
