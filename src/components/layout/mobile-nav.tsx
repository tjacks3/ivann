"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MessageSquare, User, LayoutDashboard, Handshake, Settings } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { t } = useTranslation();
  const { user } = useUser();
  const pathname = usePathname();
  const unreadCount = useUnreadCount();

  const creatorTabs = [
    { href: "/creator/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/creator/profile", label: t("nav.myProfile"), icon: User },
    { href: "/collaborations", label: t("nav.collaborations"), icon: Handshake },
    { href: "/messages", label: t("nav.messages"), icon: MessageSquare },
    { href: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  const brandTabs = [
    { href: "/brand/dashboard", label: t("nav.brandDashboard"), icon: LayoutDashboard },
    { href: "/discover", label: t("nav.discover"), icon: Compass },
    { href: "/collaborations", label: t("nav.collaborations"), icon: Handshake },
    { href: "/messages", label: t("nav.messages"), icon: MessageSquare },
    { href: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  const tabs = user?.role === "brand" ? brandTabs : creatorTabs;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const isMessages = tab.href === "/messages";
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <tab.icon className="size-5" />
              {isMessages && unreadCount > 0 && (
                <span className="absolute right-0 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
