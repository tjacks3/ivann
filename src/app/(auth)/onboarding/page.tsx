"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building2 } from "lucide-react";
import { useTranslation } from "@/i18n";

export default function OnboardingPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("onboarding.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("onboarding.subtitle")}
        </p>
      </div>

      <p className="text-center text-sm font-medium text-muted-foreground">
        {t("onboarding.selectRole")}
      </p>

      <div className="grid gap-4">
        <Card className="cursor-pointer transition-all hover:ring-2 hover:ring-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <User className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle>{t("onboarding.creator")}</CardTitle>
                <CardDescription>{t("onboarding.creatorDescription")}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer transition-all hover:ring-2 hover:ring-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle>{t("onboarding.brand")}</CardTitle>
                <CardDescription>{t("onboarding.brandDescription")}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Button className="w-full" size="lg">
        {t("onboarding.continue")}
      </Button>
    </div>
  );
}
