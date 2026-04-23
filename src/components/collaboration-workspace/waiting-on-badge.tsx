"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getWaitingParty } from "@/lib/collaboration-utils";

interface WaitingOnBadgeProps {
  state: string;
  userRole: "brand" | "creator";
  className?: string;
}

export function WaitingOnBadge({
  state,
  userRole,
  className,
}: WaitingOnBadgeProps) {
  const waitingOn = getWaitingParty(state);

  if (!waitingOn) return null;

  const isWaitingOnYou = waitingOn === userRole;

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        isWaitingOnYou
          ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
          : "border-muted bg-muted/50 text-muted-foreground",
        className,
      )}
    >
      {isWaitingOnYou
        ? "Waiting on you"
        : `Waiting on ${waitingOn}`}
    </Badge>
  );
}
