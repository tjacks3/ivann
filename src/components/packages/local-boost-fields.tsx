"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { MapPin, Store, Info } from "lucide-react";

const LOCAL_CATEGORIES = [
  "restaurant",
  "cafe",
  "retail",
  "salon",
  "gym",
  "service",
  "other",
] as const;

const SUGGESTED_DELIVERABLES = [
  "in_store_visit",
  "story_mention",
  "short_review",
  "tagged_location",
  "community_feature",
] as const;

interface LocalBoostFieldsProps {
  onDeliverablesChange: (items: string[]) => void;
  onDescriptionChange: (desc: string) => void;
  initialDeliverables: string[];
}

export function LocalBoostFields({
  onDeliverablesChange,
  onDescriptionChange,
  initialDeliverables,
}: LocalBoostFieldsProps) {
  const { t } = useTranslation();
  const [localOnly, setLocalOnly] = useState(true);
  const [city, setCity] = useState("");
  const [inPersonVisit, setInPersonVisit] = useState(true);
  const [businessCategory, setBusinessCategory] = useState("restaurant");
  const [selectedDeliverables, setSelectedDeliverables] = useState<Set<string>>(
    () => new Set(SUGGESTED_DELIVERABLES.slice(0, 3)),
  );

  const onDeliverablesRef = useRef(onDeliverablesChange);
  const onDescriptionRef = useRef(onDescriptionChange);
  onDeliverablesRef.current = onDeliverablesChange;
  onDescriptionRef.current = onDescriptionChange;

  // Sync deliverables to parent
  useEffect(() => {
    const items = [...selectedDeliverables].map((key) =>
      t(`packages.localBoost.deliverable.${key}`),
    );
    if (inPersonVisit && !selectedDeliverables.has("in_store_visit")) {
      items.unshift(t("packages.localBoost.deliverable.in_store_visit"));
    }
    onDeliverablesRef.current(items);
  }, [selectedDeliverables, inPersonVisit, t]);

  // Sync description to parent
  useEffect(() => {
    const categoryLabel = t(`packages.localBoost.category.${businessCategory}`);
    const locationPart = city ? ` in ${city}` : "";
    const desc = `${t("packages.localBoost.descriptionPrefix")} ${categoryLabel}${locationPart}. ${t("packages.localBoost.descriptionSuffix")}`;
    onDescriptionRef.current(desc);
  }, [businessCategory, city, t]);

  const toggleDeliverable = (key: string) => {
    setSelectedDeliverables((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MapPin className="size-4 text-amber-600" />
        <p className="text-sm font-semibold text-amber-700">
          {t("packages.localBoost.title")}
        </p>
      </div>

      {/* Value messaging */}
      <div className="flex items-start gap-2 rounded-md bg-background px-3 py-2">
        <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          {t("packages.localBoost.valueTip")}
        </p>
      </div>

      {/* Local only + In-person toggles */}
      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={localOnly}
            onChange={(e) => setLocalOnly(e.target.checked)}
            className="size-4 rounded border-input accent-primary"
          />
          <span className="text-sm">{t("packages.localBoost.localOnly")}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={inPersonVisit}
            onChange={(e) => setInPersonVisit(e.target.checked)}
            className="size-4 rounded border-input accent-primary"
          />
          <span className="text-sm">{t("packages.localBoost.inPerson")}</span>
        </label>
      </div>

      {/* City / Region */}
      {localOnly && (
        <div className="space-y-1.5">
          <Label className="text-xs">{t("packages.localBoost.city")}</Label>
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t("packages.localBoost.cityPlaceholder")}
          />
        </div>
      )}

      {/* Business category */}
      <div className="space-y-1.5">
        <Label className="text-xs">{t("packages.localBoost.categoryLabel")}</Label>
        <div className="flex flex-wrap gap-1.5">
          {LOCAL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setBusinessCategory(cat)}
              className={cn(
                "cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                businessCategory === cat
                  ? "border-amber-500 bg-amber-500/10 text-amber-700"
                  : "border-input text-muted-foreground hover:border-amber-500/30",
              )}
            >
              {t(`packages.localBoost.category.${cat}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested deliverables */}
      <div className="space-y-1.5">
        <Label className="text-xs">{t("packages.localBoost.suggestedDeliverables")}</Label>
        <div className="space-y-1.5">
          {SUGGESTED_DELIVERABLES.map((key) => {
            const isSelected = selectedDeliverables.has(key);
            return (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-background"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleDeliverable(key)}
                  className="size-4 rounded border-input accent-primary"
                />
                <span className="text-sm">{t(`packages.localBoost.deliverable.${key}`)}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Brand-friendly helper */}
      <div className="rounded-md bg-background px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <Store className="size-3.5 text-amber-600" />
          <p className="text-xs font-medium text-amber-700">
            {t("packages.localBoost.brandHelper")}
          </p>
        </div>
      </div>
    </div>
  );
}
