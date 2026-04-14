"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface StepLocalPreferenceProps {
  localOnly: boolean;
  radius: number;
  brandLocation: string | null;
  city: string;
  state: string;
  onLocalOnlyChange: (value: boolean) => void;
  onRadiusChange: (value: number) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
}

export function StepLocalPreference({
  localOnly,
  radius,
  brandLocation,
  city,
  state,
  onLocalOnlyChange,
  onRadiusChange,
  onCityChange,
  onStateChange,
}: StepLocalPreferenceProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{t("quickCollab.localPref.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("quickCollab.localPref.subtitle")}
        </p>
      </div>

      {/* Checkbox */}
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
          localOnly
            ? "border-primary bg-primary/5"
            : "border-input hover:border-primary/30",
        )}
      >
        <input
          type="checkbox"
          checked={localOnly}
          onChange={(e) => onLocalOnlyChange(e.target.checked)}
          className="mt-0.5 size-4 rounded border-input accent-primary"
        />
        <div>
          <p className="text-sm font-medium">{t("quickCollab.localPref.checkbox")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("quickCollab.localPref.helper")}
          </p>
        </div>
      </label>

      {/* Location details — shown when localOnly is checked */}
      {localOnly && (
        <div className="space-y-4 rounded-lg border border-dashed border-border p-4">
          {/* Brand location from profile */}
          {brandLocation ? (
            <div className="space-y-1">
              <Label>{t("quickCollab.localPref.brandLocation")}</Label>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-3.5 text-muted-foreground" />
                <span>{brandLocation}</span>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {t("quickCollab.localPref.noLocation")}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">{t("quickCollab.location.city")}</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => onCityChange(e.target.value)}
                    placeholder={t("quickCollab.location.cityPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">{t("quickCollab.location.state")}</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => onStateChange(e.target.value)}
                    placeholder={t("quickCollab.location.statePlaceholder")}
                  />
                </div>
              </div>
            </>
          )}

          {/* Radius */}
          <div className="space-y-2">
            <Label htmlFor="radius">{t("quickCollab.localPref.radius")}</Label>
            <Input
              id="radius"
              type="number"
              min={5}
              max={500}
              value={radius}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0) onRadiusChange(val);
              }}
              className="max-w-40"
            />
          </div>
        </div>
      )}
    </div>
  );
}
