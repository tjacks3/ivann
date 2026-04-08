"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { useTranslation } from "@/i18n";

interface CreatorReviewStepProps {
  data: {
    fullName?: string;
    username?: string;
    bio?: string;
    category?: string;
    location?: string;
  };
  onEditStep: (step: number) => void;
}

export function CreatorReviewStep({ data, onEditStep }: CreatorReviewStepProps) {
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
            {data.fullName && (
              <div>
                <dt className="text-xs text-muted-foreground">{t("onboarding.creatorProfile.displayName")}</dt>
                <dd className="mt-1 font-medium">{data.fullName}</dd>
              </div>
            )}
            {data.username && (
              <div>
                <dt className="text-xs text-muted-foreground">{t("onboarding.creatorProfile.username")}</dt>
                <dd className="mt-1 font-medium">@{data.username}</dd>
              </div>
            )}
            {data.category && (
              <div>
                <dt className="text-xs text-muted-foreground">{t("onboarding.creatorProfile.category")}</dt>
                <dd className="mt-1 font-medium">{t(`onboarding.category.${data.category}`)}</dd>
              </div>
            )}
            {data.location && (
              <div>
                <dt className="text-xs text-muted-foreground">{t("onboarding.creatorProfile.location")}</dt>
                <dd className="mt-1 font-medium">{data.location}</dd>
              </div>
            )}
            {data.bio && (
              <div>
                <dt className="text-xs text-muted-foreground">{t("onboarding.creatorProfile.bio")}</dt>
                <dd className="mt-1 font-medium">{data.bio}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
