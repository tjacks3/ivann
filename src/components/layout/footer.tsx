"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n";
import { LanguageSelector } from "@/components/layout/language-selector";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto bg-primary">
      <div className="flex w-full flex-col gap-6 px-4 py-8 text-sm text-primary-foreground sm:px-6 lg:px-8">
        {/* Top row: links */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/creators" className="text-primary-foreground/80 hover:text-primary-foreground">
              {t("footer.forCreators")}
            </Link>
            <Link href="/brands" className="text-primary-foreground/80 hover:text-primary-foreground">
              {t("footer.forBrands")}
            </Link>
            <Link href="/discover" className="text-primary-foreground/80 hover:text-primary-foreground">
              {t("nav.discover")}
            </Link>
            <Link href="/about" className="text-primary-foreground/80 hover:text-primary-foreground">
              {t("footer.about")}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-primary-foreground/80 hover:text-primary-foreground">
              {t("footer.terms")}
            </Link>
            <Link href="/privacy" className="text-primary-foreground/80 hover:text-primary-foreground">
              {t("footer.privacy")}
            </Link>
            <LanguageSelector />
          </div>
        </div>
        {/* Bottom row: copyright */}
        <div className="text-center text-primary-foreground/60 sm:text-left">
          <p>{t("footer.rights", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
