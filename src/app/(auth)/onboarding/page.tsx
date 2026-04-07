"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building2, Loader2 } from "lucide-react";
import { useTranslation } from "@/i18n";
import { createProfile } from "./actions";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

export default function OnboardingPage() {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleContinue = () => {
    if (!selectedRole) return;
    startTransition(() => createProfile(selectedRole));
  };

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
        <Card
          className={cn(
            "cursor-pointer transition-all hover:ring-2 hover:ring-primary",
            selectedRole === "creator" && "ring-2 ring-primary",
          )}
          onClick={() => setSelectedRole("creator")}
        >
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

        <Card
          className={cn(
            "cursor-pointer transition-all hover:ring-2 hover:ring-primary",
            selectedRole === "brand" && "ring-2 ring-primary",
          )}
          onClick={() => setSelectedRole("brand")}
        >
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

      <Button
        className="w-full"
        size="lg"
        disabled={!selectedRole || isPending}
        onClick={handleContinue}
      >
        {isPending && <Loader2 className="animate-spin" />}
        {t("onboarding.continue")}
      </Button>
    </div>
  );
}
