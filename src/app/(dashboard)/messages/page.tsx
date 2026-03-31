"use client";

import { useTranslation } from "@/i18n";

export default function MessagesPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("messages.title")}</h1>
      <p className="mt-2 text-muted-foreground">
        {t("messages.subtitle")}
      </p>
    </div>
  );
}
