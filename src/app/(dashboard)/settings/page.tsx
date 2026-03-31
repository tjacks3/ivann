"use client";

import { useTranslation } from "@/i18n";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
      <p className="mt-2 text-muted-foreground">
        {t("settings.subtitle")}
      </p>
    </div>
  );
}
