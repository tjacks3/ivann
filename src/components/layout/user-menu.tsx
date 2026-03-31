"use client";

import Link from "next/link";
import { User, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/i18n";

interface UserMenuProps {
  name: string;
  email: string;
  avatarUrl?: string;
}

export function UserMenu({ name, email, avatarUrl }: UserMenuProps) {
  const { t } = useTranslation();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar>
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />}>
          <User className="size-4" />
          {t("userMenu.editProfile")}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings className="size-4" />
          {t("userMenu.settings")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOut className="size-4" />
          {t("userMenu.logOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
