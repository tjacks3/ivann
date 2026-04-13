"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

const INTENT_PRESETS = [
  "local_awareness",
  "new_menu_item",
  "grand_opening",
  "drive_weekend_visits",
  "special_offer",
] as const;

interface StepCampaignIntentProps {
  campaignIntent: string;
  onCampaignIntentChange: (value: string) => void;
}

export function StepCampaignIntent({
  campaignIntent,
  onCampaignIntentChange,
}: StepCampaignIntentProps) {
  const { t } = useTranslation();
  const [isCustom, setIsCustom] = useState(
    !INTENT_PRESETS.includes(campaignIntent as (typeof INTENT_PRESETS)[number]) && campaignIntent !== "",
  );

  const handlePresetClick = (preset: string) => {
    setIsCustom(false);
    onCampaignIntentChange(preset);
  };

  const handleCustomToggle = () => {
    setIsCustom(true);
    onCampaignIntentChange("");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{t("quickCollab.intent.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("quickCollab.intent.subtitle")}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {INTENT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                !isCustom && campaignIntent === preset
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {t(`quickCollab.intentOption.${preset}`)}
            </button>
          ))}
          <button
            type="button"
            onClick={handleCustomToggle}
            className={cn(
              "cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              isCustom
                ? "border-primary bg-primary/10 text-primary"
                : "border-input text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
          >
            {t("quickCollab.intent.custom")}
          </button>
        </div>

        {isCustom && (
          <Textarea
            value={campaignIntent}
            onChange={(e) => onCampaignIntentChange(e.target.value)}
            placeholder={t("quickCollab.intent.customPlaceholder")}
            className="min-h-20"
            maxLength={500}
          />
        )}
      </div>
    </div>
  );
}
