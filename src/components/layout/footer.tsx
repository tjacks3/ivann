"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n";
import { LanguageSelector } from "@/components/layout/language-selector";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto bg-primary">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center text-sm text-primary-foreground sm:flex-row sm:justify-between sm:text-left">
        <p>{t("footer.rights", { year: new Date().getFullYear() })}</p>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="text-primary-foreground/80 hover:text-primary-foreground">
            {t("footer.terms")}
          </Link>
          <Link href="/privacy" className="text-primary-foreground/80 hover:text-primary-foreground">
            {t("footer.privacy")}
          </Link>
          <Link href="/about" className="text-primary-foreground/80 hover:text-primary-foreground">
            {t("footer.about")}
          </Link>
          <LanguageSelector />
        </div>
      </div>
    </footer>
  );
}
