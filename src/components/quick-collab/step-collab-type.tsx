"use client";

import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { Camera, Image, MonitorPlay, Music, Mic, MoreHorizontal } from "lucide-react";

const COLLAB_TYPES = [
  { value: "instagram_story", icon: Camera },
  { value: "instagram_post", icon: Image },
  { value: "youtube_promo", icon: MonitorPlay },
  { value: "tiktok_post", icon: Music },
  { value: "podcast_mention", icon: Mic },
  { value: "other", icon: MoreHorizontal },
] as const;

interface StepCollabTypeProps {
  collabType: string;
  collabTypeOther: string;
  onCollabTypeChange: (value: string) => void;
  onCollabTypeOtherChange: (value: string) => void;
}

export function StepCollabType({
  collabType,
  collabTypeOther,
  onCollabTypeChange,
  onCollabTypeOtherChange,
}: StepCollabTypeProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{t("quickCollab.collabType.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("quickCollab.collabType.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {COLLAB_TYPES.map(({ value, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onCollabTypeChange(value)}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3.5 text-left transition-colors",
              collabType === value
                ? "border-primary bg-primary/10 text-primary"
                : "border-input text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                collabType === value
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {t(`quickCollab.collabTypeOption.${value}`)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(`quickCollab.collabTypeHint.${value}`)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {collabType === "other" && (
        <Input
          value={collabTypeOther}
          onChange={(e) => onCollabTypeOtherChange(e.target.value)}
          placeholder={t("quickCollab.collabType.otherPlaceholder")}
          maxLength={200}
        />
      )}
    </div>
  );
}
