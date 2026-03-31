"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n";
import { LanguageSelector } from "@/components/layout/language-selector";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
        <p>{t("footer.rights", { year: new Date().getFullYear() })}</p>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-primary">
            {t("footer.terms")}
          </Link>
          <Link href="/privacy" className="hover:text-primary">
            {t("footer.privacy")}
          </Link>
          <LanguageSelector />
        </div>
      </div>
    </footer>
  );
}
