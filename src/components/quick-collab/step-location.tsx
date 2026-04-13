"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n";

interface StepLocationProps {
  city: string;
  state: string;
  radius: number | undefined;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onRadiusChange: (value: number | undefined) => void;
}

export function StepLocation({
  city,
  state,
  radius,
  onCityChange,
  onStateChange,
  onRadiusChange,
}: StepLocationProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{t("quickCollab.location.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("quickCollab.location.subtitle")}
        </p>
      </div>

      <div className="space-y-4">
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

        <div className="space-y-2">
          <Label htmlFor="radius">
            {t("quickCollab.location.radius")}{" "}
            <span className="text-muted-foreground">({t("quickCollab.location.optional")})</span>
          </Label>
          <Input
            id="radius"
            type="number"
            min={1}
            max={500}
            value={radius ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onRadiusChange(val ? parseInt(val, 10) : undefined);
            }}
            placeholder={t("quickCollab.location.radiusPlaceholder")}
            className="max-w-40"
          />
        </div>
      </div>
    </div>
  );
}
