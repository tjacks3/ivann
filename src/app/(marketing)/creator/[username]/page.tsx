"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ProfileHeader } from "@/components/profile/profile-header";
import { PlatformGrid, type PlatformData } from "@/components/profile/platform-grid";
import { PackagePublicCard } from "@/components/packages/package-public-card";
import { RelatedCreators } from "@/components/discover/related-creators";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { ArrowLeft, Users, UserX } from "lucide-react";
import { getPublicCreatorProfile } from "./actions";

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export default function PublicCreatorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { t } = useTranslation();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-creator", username],
    queryFn: () => getPublicCreatorProfile(username),
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (!profile) {
    return (
      <PageContainer size="narrow">
        <EmptyState
          icon={<UserX className="size-6" />}
          title={t("publicProfile.notFound.title")}
          description={t("publicProfile.notFound.description")}
          action={
            <Button variant="outline" render={<Link href="/discover" />}>
              <ArrowLeft className="size-3.5" />
              {t("publicProfile.backToDiscover")}
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const platforms: PlatformData[] = (profile.socialAccounts ?? []).map((sa) => ({
    platform: sa.platform.charAt(0).toUpperCase() + sa.platform.slice(1),
    handle: sa.handle,
    followers: sa.followerCount,
    engagement: undefined,
  }));

  const totalFollowers = platforms.reduce((sum, p) => sum + p.followers, 0);
  const isVerified = (profile.socialAccounts ?? []).some((sa) => sa.isVerified);
  const activePackages = (profile.packages ?? []).filter((pkg) => pkg.status === "active");

  return (
    <PageContainer size="narrow">
      {/* Back nav */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" render={<Link href="/discover" />}>
          <ArrowLeft className="size-3.5" />
          {t("publicProfile.backToDiscover")}
        </Button>
      </div>

      <div className="space-y-12">
        <ProfileHeader
          name={profile.fullName || ""}
          avatarUrl={profile.avatarUrl ?? undefined}
          bio={profile.bio ?? undefined}
          categories={profile.categories}
          website={profile.website}
          publicEmail={profile.publicEmail}
          isVerified={isVerified}
        />

        {/* Connected Platforms */}
        {platforms.length > 0 && (
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
        )}

        {/* Packages */}
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

        {/* Related Creators */}
        <RelatedCreators />
      </div>
    </PageContainer>
  );
}
