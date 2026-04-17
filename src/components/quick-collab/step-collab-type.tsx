"use client";

import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { getPlatformMeta } from "@/lib/social/platforms";
import { Mic, MoreHorizontal } from "lucide-react";

const COLLAB_TYPES = [
  { value: "instagram_story", icon: getPlatformMeta("instagram").icon, color: getPlatformMeta("instagram").color },
  { value: "instagram_post", icon: getPlatformMeta("instagram").icon, color: getPlatformMeta("instagram").color },
  { value: "youtube_promo", icon: getPlatformMeta("youtube").icon, color: getPlatformMeta("youtube").color },
  { value: "tiktok_post", icon: getPlatformMeta("tiktok").icon, color: getPlatformMeta("tiktok").color },
  { value: "podcast_mention", icon: Mic, color: undefined },
  { value: "other", icon: MoreHorizontal, color: undefined },
];

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
        {COLLAB_TYPES.map(({ value, icon: Icon, color }) => (
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
                  ? "bg-primary/20"
                  : "bg-muted",
              )}
              style={color && collabType !== value ? { color } : undefined}
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
