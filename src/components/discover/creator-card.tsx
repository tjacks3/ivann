"use client";

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, BadgeCheck } from "lucide-react";
import { getPlatformMeta } from "@/lib/social/platforms";
import { FavoriteButton } from "./favorite-button";
import { useTranslation } from "@/i18n";
import type { CreatorResult } from "@/app/(marketing)/discover/actions";

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

interface CreatorCardProps {
  creator: CreatorResult;
  isFavorited?: boolean;
  showFavorite?: boolean;
}

export function CreatorCard({ creator, isFavorited = false, showFavorite = false }: CreatorCardProps) {
  const { t } = useTranslation();
  const initials = (creator.fullName || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const displayCategories = creator.categories?.slice(0, 3) ?? [];
  const extraCount = (creator.categories?.length ?? 0) - 3;

  return (
    <Link href={`/creator/${creator.username}`} className="block">
    <Card className="relative transition-all hover:shadow-md hover:scale-[1.01]">
      {showFavorite && (
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton creatorId={creator.id} isFavorited={isFavorited} />
        </div>
      )}
      <CardContent className="space-y-3 pt-4">
        {/* Header: avatar + name */}
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            {creator.avatarUrl && (
              <AvatarImage src={creator.avatarUrl} alt={creator.fullName || ""} />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold truncate">{creator.fullName}</p>
              {creator.isVerified && (
                <BadgeCheck className="size-4 shrink-0 fill-primary text-primary-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              @{creator.username}
            </p>
          </div>
        </div>

        {/* Bio */}
        {creator.bio && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {creator.bio}
          </p>
        )}

        {/* Categories */}
        {displayCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {displayCategories.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-primary bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {t(`onboarding.category.${cat}`)}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="rounded-full border border-input bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                +{extraCount}
              </span>
            )}
          </div>
        )}

        {/* Footer: stats + platforms */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="size-3.5" />
              <span className="font-semibold text-foreground">
                {formatCount(creator.totalFollowers)}
              </span>
            </div>
            {creator.location && (
              <div className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                <span className="truncate max-w-[120px]">{creator.location}</span>
              </div>
            )}
          </div>

          {/* Platform icons */}
          {creator.platforms && creator.platforms.length > 0 && (
            <div className="flex items-center gap-1.5">
              {creator.platforms.filter(Boolean).map((p) => {
                const meta = getPlatformMeta(p);
                const Icon = meta.icon;
                return (
                  <Icon
                    key={p}
                    className="size-3.5"
                    style={{ color: meta.color }}
                    title={meta.name}
                  />
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
