"use client";

import { Clock } from "lucide-react";
import { getWaitingParty } from "@/lib/collaboration-utils";

const STALE_THRESHOLD_MS = 48 * 60 * 60 * 1000; // 48 hours

interface StaleNudgeBannerProps {
  state: string;
  updatedAt: Date;
  isBrand: boolean;
}

export function StaleNudgeBanner({
  state,
  updatedAt,
  isBrand,
}: StaleNudgeBannerProps) {
  if (state === "completed") return null;

  const elapsed = Date.now() - new Date(updatedAt).getTime();
  if (elapsed < STALE_THRESHOLD_MS) return null;

  const waitingOn = getWaitingParty(state);
  const isWaitingOnYou = waitingOn === (isBrand ? "brand" : "creator");

  const messages: Record<string, { self: string; other: string }> = {
    awaiting_brand_brief: {
      self: "You have a pending campaign brief to complete.",
      other: "The brand hasn't submitted the brief yet.",
    },
    awaiting_creator_confirmation: {
      self: "You have a brief waiting for your review.",
      other: "The creator hasn't responded to the brief yet.",
    },
    revision_requested: {
      self: "The creator requested changes to the brief.",
      other: "The brand hasn't updated the brief yet.",
    },
    in_progress: {
      self: "Don't forget to submit your deliverable when it's ready.",
      other: "The creator is still working on the deliverable.",
    },
    submitted: {
      self: "A deliverable is waiting for your review.",
      other: "The brand hasn't reviewed the submission yet.",
    },
  };

  const stateMessages = messages[state];
  if (!stateMessages) return null;

  const message = isWaitingOnYou ? stateMessages.self : stateMessages.other;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
      <Clock className="size-4 shrink-0 text-amber-600" />
      <p className="text-sm text-amber-700">{message}</p>
    </div>
  );
}
