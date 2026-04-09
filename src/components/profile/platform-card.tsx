"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getPlatformMeta } from "@/lib/social/platforms";
import { cn } from "@/lib/utils";

interface PlatformCardProps {
  platform: string;
  handle: string;
  followers: number;
  engagement?: number;
  /** Share of total followers (0-1), used for mosaic sizing */
  share?: number;
}

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export function PlatformCard({
  platform,
  handle,
  followers,
  engagement,
  share,
}: PlatformCardProps) {
  const meta = getPlatformMeta(platform.toLowerCase());
  const Icon = meta.icon;
  const isLarge = share !== undefined && share >= 0.35;

  return (
    <Card
      className={cn(
        "overflow-hidden border transition-all hover:shadow-md hover:scale-[1.01]",
      )}
      style={{ backgroundColor: `${meta.color}08` }}
    >
      <CardContent
        className={cn(
          "flex flex-col justify-between",
          isLarge ? "gap-6 p-6" : "gap-4 p-4",
        )}
      >
        {/* Top: icon + platform name */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-xl",
              isLarge ? "size-12" : "size-9",
            )}
            style={{ backgroundColor: `${meta.color}18` }}
          >
            <Icon
              className={isLarge ? "size-6" : "size-4"}
              style={{ color: meta.color }}
            />
          </div>
          <div>
            <p className={cn("font-semibold", isLarge ? "text-base" : "text-sm")}>
              {meta.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {meta.handlePrefix}{handle}
            </p>
          </div>
        </div>

        {/* Bottom: stats */}
        <div>
          <p className={cn("font-bold", isLarge ? "text-3xl" : "text-xl")}>
            {formatCount(followers)}
          </p>
          <p className="text-xs text-muted-foreground">
            {engagement !== undefined
              ? `${engagement.toFixed(1)}% engagement`
              : "followers"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
