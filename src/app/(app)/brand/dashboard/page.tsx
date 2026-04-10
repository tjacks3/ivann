"use client";

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { useBrandProfile } from "@/hooks/use-brand-profile";
import { useTranslation } from "@/i18n";
import { Compass, Globe, LayoutDashboard } from "lucide-react";

export default function BrandDashboardPage() {
  const { t } = useTranslation();
  const { profile, isLoading } = useBrandProfile();

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (!profile) {
    return null;
  }

  const initials = (profile.brandName || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <PageContainer>
      <SectionHeader
        title={t("brandDashboard.title")}
        description={t("brandDashboard.subtitle")}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Brand Profile Card */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <Avatar className="size-16 text-lg">
                {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.brandName || ""} />}
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg font-semibold">{profile.brandName}</h2>
                {profile.industry && (
                  <p className="text-sm text-muted-foreground">{profile.industry}</p>
                )}
                {profile.bio && (
                  <p className="mt-2 line-clamp-2 max-w-md text-sm text-muted-foreground">{profile.bio}</p>
                )}
                {profile.companyWebsite && (
                  <a
                    href={profile.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Globe className="size-3.5" />
                    {profile.companyWebsite.replace(/^https?:\/\//, "")}
                  </a>
                )}

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">{t("brandDashboard.quickActions")}</h3>

          <Card className="transition-colors hover:border-primary/30">
            <CardContent className="pt-4">
              <Link href="/discover" className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Compass className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("brandDashboard.discoverCreators")}</p>
                  <p className="text-xs text-muted-foreground">{t("brandDashboard.discoverCreatorsHint")}</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Collaborations placeholder */}
      <div className="mt-8">
        <EmptyState
          icon={<LayoutDashboard className="size-6" />}
          title={t("brandDashboard.emptyTitle")}
          description={t("brandDashboard.emptyDescription")}
          action={
            <Link href="/discover" className={buttonVariants()}>
              {t("nav.discover")}
            </Link>
          }
        />
      </div>
    </PageContainer>
  );
}
