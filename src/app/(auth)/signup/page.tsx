"use client";

import { useTranslation } from "@/i18n";

export default function SignUpPage() {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold">{t("auth.signUp.title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("auth.signUp.subtitle")}
      </p>
    </div>
  );
}
