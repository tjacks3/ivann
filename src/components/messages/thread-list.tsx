"use client";

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ThreadSummary } from "@/app/(app)/messages/actions";

interface ThreadListProps {
  threads: ThreadSummary[];
}

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

export function ThreadList({ threads }: ThreadListProps) {
  return (
    <div className="divide-y">
      {threads.map((thread) => {
        const initials = (thread.otherUserName || "?")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <Link
            key={thread.id}
            href={`/messages/${thread.id}`}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <div className="relative shrink-0">
              <Avatar className="size-10">
                {thread.otherUserAvatar && (
                  <AvatarImage
                    src={thread.otherUserAvatar}
                    alt={thread.otherUserName || ""}
                  />
                )}
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              {thread.isUnread && (
                <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-primary" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "truncate text-sm",
                    thread.isUnread ? "font-semibold" : "font-medium",
                  )}
                >
                  {thread.otherUserName}
                </p>
                {thread.lastMessageAt && (
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {formatRelativeTime(thread.lastMessageAt)}
                  </span>
                )}
              </div>
              {thread.subject && (
                <p className="truncate text-xs text-muted-foreground">
                  {thread.subject}
                </p>
              )}
              {thread.lastMessageBody && (
                <p
                  className={cn(
                    "mt-0.5 truncate text-xs",
                    thread.isUnread
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {thread.lastMessageBody}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
