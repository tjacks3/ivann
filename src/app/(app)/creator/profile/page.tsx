"use client";

import { ProfileHeader } from "@/components/profile/profile-header";
import { PlatformGrid, type PlatformData } from "@/components/profile/platform-grid";
import { PackagePublicCard } from "@/components/packages/package-public-card";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { LoadingState } from "@/components/shared/loading-state";
import { useCreatorProfile } from "@/hooks/use-creator-profile";
import { useTranslation } from "@/i18n";
import { Users } from "lucide-react";
import type { ProfileStatus } from "@/types";

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export default function CreatorProfilePage() {
  const { t } = useTranslation();
  const { profile, isLoading } = useCreatorProfile();

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (!profile) {
    return null;
  }

  // Map social accounts to platform grid format
  const platforms: PlatformData[] = (profile.socialAccounts ?? []).map((sa) => ({
    platform: sa.platform.charAt(0).toUpperCase() + sa.platform.slice(1),
    handle: sa.handle,
    followers: sa.followerCount,
    engagement: undefined,
  }));

  const totalFollowers = platforms.reduce((sum, p) => sum + p.followers, 0);

  // Only show active packages on public profile
  const activePackages = (profile.packages ?? []).filter(
    (pkg) => pkg.status === "active",
  );

  return (
    <PageContainer size="narrow">
      <div className="space-y-12">
        <ProfileHeader
          name={profile.fullName || ""}
          avatarUrl={profile.avatarUrl ?? undefined}
          bio={profile.bio ?? undefined}
          categories={profile.categories}
          website={profile.website}
          publicEmail={profile.publicEmail}
          profileStatus={profile.profileStatus as ProfileStatus}
          isOwnProfile
        />

        <div>
          <SectionHeader
            title={t("profile.connectedPlatforms")}
            as="h2"
            action={
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>@{profile.username}</span>
                <span className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <Users className="size-4" />
                  <span className="font-semibold text-foreground">
                    {formatCount(totalFollowers)}
                  </span>{" "}
                  {t("profile.followers")}
                </div>
              </div>
            }
          />
          <div className="mt-4">
            <PlatformGrid platforms={platforms} />
          </div>
        </div>

        {activePackages.length > 0 && (
          <div>
            <SectionHeader
              title={t("packages.profileTitle")}
              as="h2"
              action={
                <span className="text-sm text-muted-foreground">
                  {activePackages.length} {activePackages.length === 1 ? "package" : "packages"}
                </span>
              }
            />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {activePackages.map((pkg) => (
                <PackagePublicCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
