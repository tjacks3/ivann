"use client";

import { useTranslation } from "@/i18n";

export default function RegisterPage() {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold">{t("auth.register.title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("auth.register.subtitle")}
      </p>
    </div>
  );
}
