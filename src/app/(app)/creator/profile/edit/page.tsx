"use client";

import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { Button } from "@/components/ui/button";
import { useCreatorProfile } from "@/hooks/use-creator-profile";
import { useTranslation } from "@/i18n";
import { Eye } from "lucide-react";

export default function EditProfilePage() {
  const { t } = useTranslation();
  const { profile, isLoading, refetch } = useCreatorProfile();

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (!profile) {
    return null;
  }

  return (
    <PageContainer size="narrow">
      <SectionHeader
        title={t("profile.edit.title")}
        description={t("profile.edit.subtitle")}
        action={
          <Button variant="outline" size="sm" render={<Link href="/creator/profile" />}>
            <Eye className="size-3.5" />
            {t("creatorDashboard.viewProfile")}
          </Button>
        }
      />
      <div className="mt-6">
        <ProfileEditForm profile={profile} onSaved={refetch} />
      </div>
    </PageContainer>
  );
}
