"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n";
import { LanguageSelector } from "@/components/layout/language-selector";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto bg-primary">
      <div className="flex w-full flex-col gap-6 px-4 py-8 text-sm text-white sm:px-6 lg:px-8">
        {/* Top row: links */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/creators" className="text-white hover:text-green-200">
              {t("footer.forCreators")}
            </Link>
            <Link href="/brands" className="text-white hover:text-green-200">
              {t("footer.forBrands")}
            </Link>
            <Link href="/discover" className="text-white hover:text-green-200">
              {t("nav.discover")}
            </Link>
            <Link href="/about" className="text-white hover:text-green-200">
              {t("footer.about")}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-white hover:text-green-200">
              {t("footer.terms")}
            </Link>
            <Link href="/privacy" className="text-white hover:text-green-200">
              {t("footer.privacy")}
            </Link>
            <LanguageSelector />
          </div>
        </div>
        {/* Bottom row: copyright */}
        <div className="text-center text-white sm:text-left">
          <p>{t("footer.rights", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
