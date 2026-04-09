"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProfileStatusBadge } from "./profile-status-badge";
import { Globe, Mail } from "lucide-react";
import { useTranslation } from "@/i18n";
import type { ProfileStatus } from "@/types";

interface ProfileHeaderProps {
  name: string;
  avatarUrl?: string;
  bio?: string;
  categories: string[];
  website?: string | null;
  publicEmail?: string | null;
  profileStatus?: ProfileStatus;
  isOwnProfile?: boolean;
}

export function ProfileHeader({
  name,
  avatarUrl,
  bio,
  categories,
  website,
  publicEmail,
  profileStatus,
  isOwnProfile = false,
}: ProfileHeaderProps) {
  const { t } = useTranslation();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <section className="space-y-4">
      {/* Avatar */}
      <div>
        <Avatar className="size-28 text-xl sm:size-32">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
      </div>

      {/* Name + status */}
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-5xl font-bold">{name}</h1>
        {profileStatus && isOwnProfile && (
          <ProfileStatusBadge status={profileStatus} />
        )}
      </div>

      {/* Bio */}
      {bio && <p className="-mt-2 max-w-2xl text-sm text-muted-foreground">{bio}</p>}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="rounded-full border-primary/20 bg-primary/10 text-primary"
            >
              {t(`onboarding.category.${category}`)}
            </Badge>
          ))}
        </div>
      )}

      {/* Links */}
      {(website || publicEmail) && (
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground"
            >
              <Globe className="size-3.5" />
              {website.replace(/^https?:\/\//, "")}
            </a>
          )}
          {publicEmail && (
            <a
              href={`mailto:${publicEmail}`}
              className="flex items-center gap-1.5 hover:text-foreground"
            >
              <Mail className="size-3.5" />
              {publicEmail}
            </a>
          )}
        </div>
      )}
    </section>
  );
}
