"use client";

import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { LoadingState } from "@/components/shared/loading-state";
import { BrandEditForm } from "@/components/brand/brand-edit-form";
import { Button } from "@/components/ui/button";
import { useBrandProfile } from "@/hooks/use-brand-profile";
import { useTranslation } from "@/i18n";
import { ArrowLeft } from "lucide-react";

export default function BrandEditProfilePage() {
  const { t } = useTranslation();
  const { profile, isLoading, refetch } = useBrandProfile();

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (!profile) {
    return null;
  }

  return (
    <PageContainer size="narrow">
      <SectionHeader
        title={t("brandProfile.edit.title")}
        description={t("brandProfile.edit.subtitle")}
        action={
          <Button variant="outline" size="sm" render={<Link href="/brand/dashboard" />}>
            <ArrowLeft className="size-3.5" />
            {t("brandProfile.edit.backToDashboard")}
          </Button>
        }
      />
      <div className="mt-6">
        <BrandEditForm profile={profile} onSaved={refetch} />
      </div>
    </PageContainer>
  );
}
