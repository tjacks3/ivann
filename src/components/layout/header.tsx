"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserMenu } from "@/components/layout/user-menu";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { FavoritesDropdown } from "@/components/favorites/favorites-dropdown";
import { useUser } from "@/hooks/use-user";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { useTranslation } from "@/i18n";
import { Menu, Compass, MessageSquare, User, LayoutDashboard, Zap, Handshake, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeaderVariant } from "@/types";

interface HeaderProps {
  variant?: HeaderVariant;
}

export function Header({ variant = "marketing" }: HeaderProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useUser();
  const pathname = usePathname();
  const unreadCount = useUnreadCount();

  const marketingLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/discover", label: t("nav.discover"), icon: Compass },
  ];

  const creatorLinks = [
    { href: "/creator/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/messages", label: t("nav.messages"), icon: MessageSquare },
  ];

  const brandLinks = [
    { href: "/brand/dashboard", label: t("nav.brandDashboard"), icon: LayoutDashboard },
    { href: "/brand/quick-collab", label: t("nav.quickCollab"), icon: Zap },
    { href: "/discover", label: t("nav.discover"), icon: Compass },
    { href: "/messages", label: t("nav.messages"), icon: MessageSquare },
  ];

  const appLinks = user?.role === "brand" ? brandLinks : creatorLinks;
  const links = isAuthenticated ? appLinks : marketingLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/ivann_logo.png"
            alt="ivann"
            width={100}
            height={36}
            className="h-6 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const isMessages = link.href === "/messages";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname === link.href || (isMessages && pathname.startsWith("/messages"))
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
                {isMessages && unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              {user.role === "brand" && <FavoritesDropdown />}
              <NotificationDropdown />
              <span className="hidden text-sm font-medium md:inline">
                {user.name}
              </span>
              <UserMenu
                name={user.name}
                email={user.email}
                avatarUrl={user.avatarUrl}
                role={user.role}
              />
            </div>
          ) : !isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({ size: "sm" })}
              >
                {t("nav.getStarted")}
              </Link>
            </div>
          ) : null}

          {/* Mobile menu — only on marketing pages (app pages use bottom nav) */}
          {variant === "marketing" && (
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger aria-label={t("nav.toggleMenu")}>
                  <Menu className="size-5" />
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0" showCloseButton={false}>
                  <div className="flex h-14 items-center justify-between border-b px-4">
                    <SheetTitle className="text-base font-bold text-primary">ivann</SheetTitle>
                    <SheetClose>
                      <X className="size-5" />
                    </SheetClose>
                  </div>
                  <nav className="flex flex-col gap-1 p-4">
                    {links.map((link) => (
                      <SheetClose key={link.href} render={<Link href={link.href} />}>
                        <span
                          className={cn(
                            "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            pathname === link.href
                              ? "bg-secondary text-foreground"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                          )}
                        >
                          {link.label}
                        </span>
                      </SheetClose>
                    ))}
                    {!isAuthenticated && (
                      <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                        <SheetClose render={<Link href="/login" className={buttonVariants({ variant: "outline", className: "w-full" })} />}>
                          {t("nav.signIn")}
                        </SheetClose>
                        <SheetClose render={<Link href="/signup" className={buttonVariants({ className: "w-full" })} />}>
                          {t("nav.getStarted")}
                        </SheetClose>
                      </div>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
