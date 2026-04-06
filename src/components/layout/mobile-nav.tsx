"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MessageSquare, Package, Settings, User, LayoutDashboard } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { t } = useTranslation();
  const { user } = useUser();
  const pathname = usePathname();

  const tabs = [
    { href: "/discover", label: t("nav.discover"), icon: Compass },
    { href: "/messages", label: t("nav.messages"), icon: MessageSquare },
    {
      href: user?.role === "brand" ? "/brand/dashboard" : "/creator/profile",
      label: user?.role === "brand" ? t("nav.brandDashboard") : t("nav.myProfile"),
      icon: user?.role === "brand" ? LayoutDashboard : User,
    },
    { href: "/packages", label: t("nav.packages"), icon: Package },
    { href: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <tab.icon className="size-5" />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
