"use client";

import { Globe } from "lucide-react";
import { useTranslation, SUPPORTED_LOCALES } from "@/i18n";

export function LanguageSelector() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className="flex items-center gap-1.5">
      <Globe className="size-3.5 text-muted-foreground" />
      <label htmlFor="language-select" className="sr-only">
        {t("footer.language")}
      </label>
      <select
        id="language-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        className="cursor-pointer appearance-none border-none bg-transparent text-sm text-muted-foreground outline-none hover:text-primary"
      >
        {SUPPORTED_LOCALES.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
