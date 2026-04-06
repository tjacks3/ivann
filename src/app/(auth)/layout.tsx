"use client";

import Link from "next/link";
import Image from "next/image";
import { LanguageSelector } from "@/components/layout/language-selector";
import { useTranslation } from "@/i18n";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left brand panel — desktop only */}
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
        <Link href="/">
          <Image
            src="/ivann_logo.png"
            alt="ivann"
            width={100}
            height={36}
            className="h-6 w-auto brightness-0 invert"
            priority
          />
        </Link>

        <div>
          <h2 className="text-2xl font-bold">{t("auth.brandPanel.tagline")}</h2>
          <p className="mt-2 text-sm text-primary-foreground/80">
            {t("auth.brandPanel.description")}
          </p>
        </div>

        <LanguageSelector />
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile-only logo */}
          <div className="text-center md:hidden">
            <Link href="/" className="inline-block">
              <Image
                src="/ivann_logo.png"
                alt="ivann"
                width={100}
                height={36}
                className="mx-auto h-8 w-auto"
                priority
              />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
