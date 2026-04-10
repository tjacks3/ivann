"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { useUser } from "@/hooks/use-user";
import { useTranslation } from "@/i18n";

export function HeroSection() {
  const { t } = useTranslation();
  const { isAuthenticated } = useUser();

  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
      <span className="mb-6 rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
        {t("hero.badge")}
      </span>

      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        {t("hero.title")}{" "}
        <span className="text-primary">{t("hero.titleHighlight")}</span>.
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
        {t("hero.description")}
      </p>

      <div className="mt-10 flex items-center justify-center gap-4">
        <Link href="/signup" className={buttonVariants({ size: "lg" })}>
          {t("nav.getStarted")}
        </Link>
        {!isAuthenticated && (
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {t("nav.signIn")}
          </Link>
        )}
      </div>
    </div>
  );
}
