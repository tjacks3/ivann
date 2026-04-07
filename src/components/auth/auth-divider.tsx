"use client";

import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/i18n";

export function AuthDivider() {
  const { t } = useTranslation();

  return (
    <div className="relative my-6">
      <Separator />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-xs text-muted-foreground">
        {t("auth.orContinueWith")}
      </span>
    </div>
  );
}
