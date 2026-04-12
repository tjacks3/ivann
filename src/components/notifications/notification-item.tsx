"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Handshake, MessageSquare, Bell } from "lucide-react";
import { markAsRead } from "@/app/(app)/notifications/actions";
import { cn } from "@/lib/utils";
import type { Notification } from "@/db/schema/notifications";

const typeIcons: Record<string, typeof Bell> = {
  collab_request: Handshake,
  collab_update: Handshake,
  message: MessageSquare,
  system: Bell,
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
}

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const Icon = typeIcons[notification.type] ?? Bell;

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-count"] });
    }
    onClose();
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
        !notification.isRead && "bg-primary/5",
      )}
    >
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-snug",
              notification.isRead ? "text-muted-foreground" : "font-medium text-foreground",
            )}
          >
            {notification.title}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">
              {formatRelativeTime(notification.createdAt)}
            </span>
            {!notification.isRead && (
              <span className="size-2 rounded-full bg-primary" />
            )}
          </div>
        </div>
        {notification.body && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {notification.body}
          </p>
        )}
      </div>
    </button>
  );
}
