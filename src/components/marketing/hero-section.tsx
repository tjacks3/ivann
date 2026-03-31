"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
      <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1.5 text-xs font-medium">
        {t("hero.badge")}
      </Badge>

      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        {t("hero.title")}{" "}
        <span className="text-primary">{t("hero.titleHighlight")}</span>.
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
        {t("hero.description")}
      </p>

      <div className="mt-10 flex items-center gap-4">
        <Link href="/register" className={buttonVariants({ size: "lg" })}>
          {t("nav.getStarted")}
        </Link>
        <Link
          href="/login"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          {t("nav.signIn")}
        </Link>
      </div>
    </div>
  );
}
