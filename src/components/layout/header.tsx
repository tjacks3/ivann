"use client";

import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button-variants";
import { UserMenu } from "@/components/layout/user-menu";
import { useTranslation } from "@/i18n";
import { Menu, X } from "lucide-react";
import { useState } from "react";

// TODO: Replace with real auth state from Supabase
const mockUser = null as null | {
  name: string;
  email: string;
  avatarUrl?: string;
};

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();
  const user = mockUser;

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/messages", label: t("nav.messages") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/ivann_logo.png"
            alt="ivann"
            width={100}
            height={36}
            className="h-8 w-auto sm:h-6"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <UserMenu
              name={user.name}
              email={user.email}
              avatarUrl={user.avatarUrl}
            />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                {t("nav.signIn")}
              </Link>
              <Link href="/register" className={buttonVariants({ size: "sm" })}>
                {t("nav.getStarted")}
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={t("nav.toggleMenu")}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-3 pt-2">
                <UserMenu
                  name={user.name}
                  email={user.email}
                  avatarUrl={user.avatarUrl}
                />
                <span className="text-sm">{user.name}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "w-full",
                  })}
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  href="/register"
                  className={buttonVariants({
                    size: "sm",
                    className: "w-full",
                  })}
                >
                  {t("nav.getStarted")}
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
