"use client";

import { useTranslation } from "@/i18n";

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold">{t("auth.signIn.title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("auth.signIn.subtitle")}
      </p>
    </div>
  );
}
