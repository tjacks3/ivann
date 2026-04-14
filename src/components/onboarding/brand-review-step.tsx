"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { useTranslation } from "@/i18n";

interface BrandReviewStepProps {
  data: {
    brandName?: string;
    contactName?: string;
    companyWebsite?: string;
    bio?: string;
    industry?: string;
    location?: string;
  };
  onEditStep: (step: number) => void;
}

export function BrandReviewStep({ data, onEditStep }: BrandReviewStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">{t("onboarding.review.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("onboarding.review.subtitle")}</p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="mb-4 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <Pencil className="size-3" />
            {t("onboarding.review.edit")}
          </button>

          <dl className="space-y-4 text-sm">
            {data.brandName && (
              <div>
                <dt className="text-xs text-muted-foreground">{t("onboarding.brandProfile.brandName")}</dt>
                <dd className="mt-1 font-medium">{data.brandName}</dd>
              </div>
            )}
            {data.contactName && (
              <div>
                <dt className="text-xs text-muted-foreground">{t("onboarding.brandProfile.contactName")}</dt>
                <dd className="mt-1 font-medium">{data.contactName}</dd>
              </div>
            )}
            {data.companyWebsite && (
              <div>
                <dt className="text-xs text-muted-foreground">{t("onboarding.brandProfile.website")}</dt>
                <dd className="mt-1 font-medium">{data.companyWebsite}</dd>
              </div>
            )}
            {data.industry && (
              <div>
                <dt className="text-xs text-muted-foreground">{t("onboarding.brandProfile.industry")}</dt>
                <dd className="mt-1 font-medium">{t(`onboarding.category.${data.industry}`)}</dd>
              </div>
            )}
            {data.location && (
              <div>
                <dt className="text-xs text-muted-foreground">{t("onboarding.brandProfile.location")}</dt>
                <dd className="mt-1 font-medium">{data.location}</dd>
              </div>
            )}
            {data.bio && (
              <div>
                <dt className="text-xs text-muted-foreground">{t("onboarding.brandProfile.description")}</dt>
                <dd className="mt-1 font-medium">{data.bio}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
