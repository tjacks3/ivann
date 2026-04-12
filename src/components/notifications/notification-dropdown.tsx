"use client";

import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { NotificationItem } from "./notification-item";
import { useNotifications } from "@/hooks/use-notifications";
import { useNotificationCount } from "@/hooks/use-notification-count";
import { markAllRead } from "@/app/(app)/notifications/actions";
import { useTranslation } from "@/i18n";

export function NotificationDropdown() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const count = useNotificationCount();
  const { notifications } = useNotifications();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleMarkAllRead = async () => {
    await markAllRead();
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notification-count"] });
  };

  return (
    <div ref={ref} className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            onClick={() => setOpen(!open)}
            className="relative cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={t("notifications.title")}
          >
            <Bell className="size-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </TooltipTrigger>
          {!open && <TooltipContent>{t("notifications.title")}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border bg-popover shadow-lg sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">{t("notifications.title")}</h3>
            {count > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="cursor-pointer text-xs font-medium text-primary hover:underline"
              >
                {t("notifications.markAllRead")}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto mb-2 size-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t("notifications.empty")}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onClose={() => setOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
