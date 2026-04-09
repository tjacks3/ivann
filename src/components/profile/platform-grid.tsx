"use client";

import { PlatformCard } from "./platform-card";
import { useTranslation } from "@/i18n";

export interface PlatformData {
  platform: string;
  handle: string;
  followers: number;
  engagement?: number;
}

interface PlatformGridProps {
  platforms: PlatformData[];
}

export function PlatformGrid({ platforms }: PlatformGridProps) {
  const { t } = useTranslation();

  if (platforms.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {t("profile.noPlatforms")}
      </div>
    );
  }

  const totalFollowers = platforms.reduce((sum, p) => sum + p.followers, 0);
  const sorted = [...platforms].sort((a, b) => b.followers - a.followers);

  // Calculate each tile's share as a flex-grow value
  // Minimum basis ensures small tiles stay readable
  const MIN_BASIS = 180; // px — minimum tile width before wrapping

  return (
    <div className="flex flex-wrap gap-3">
      {sorted.map((p) => {
        const share = totalFollowers > 0 ? p.followers / totalFollowers : 1 / sorted.length;
        // flex-grow proportional to follower share so tiles fill the row
        // flex-basis sets the minimum size — if it doesn't fit, it wraps
        const grow = Math.max(share * 10, 1);

        return (
          <div
            key={p.platform + p.handle}
            className="min-w-0"
            style={{
              flexGrow: grow,
              flexShrink: 0,
              flexBasis: MIN_BASIS,
            }}
          >
            <PlatformCard
              platform={p.platform}
              handle={p.handle}
              followers={p.followers}
              engagement={p.engagement}
              share={share}
            />
          </div>
        );
      })}
    </div>
  );
}
