"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CollabStatusBadge } from "./status-badge";
import { Loader2, ChevronDown, ChevronUp, Rocket, Info } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import {
  acceptCollaboration,
  declineCollaboration,
  launchCollaborationWorkspace,
} from "@/app/(app)/collaborations/actions";
import { useTranslation } from "@/i18n";
import { useRouter } from "next/navigation";
import type { CollabWithDetails } from "@/app/(app)/collaborations/actions";

interface RequestCardProps {
  collab: CollabWithDetails;
  viewAs: "creator" | "brand";
  onUpdated: () => void;
}

export function RequestCard({ collab, viewAs, onUpdated }: RequestCardProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [launching, setLaunching] = useState(false);

  const otherName = viewAs === "creator" ? collab.brandName : collab.creatorName;
  const otherAvatar = viewAs === "creator" ? collab.brandAvatar : collab.creatorAvatar;
  const initials = (otherName || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleAccept = async () => {
    setLoading(true);
    const result = await acceptCollaboration(collab.id);
    if (result.success && result.collaborationWorkspaceId) {
      router.push(`/deal-workspace/${result.collaborationWorkspaceId}`);
    } else {
      onUpdated();
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    await declineCollaboration(collab.id, declineReason || undefined);
    onUpdated();
  };

  return (
    <Card>
      <CardContent className="space-y-3 pt-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-10 shrink-0">
              {otherAvatar && <AvatarImage src={otherAvatar} alt={otherName || ""} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold truncate">{collab.title}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {collab.budget != null && (
                  <span>
                    <span className="font-medium text-foreground">Budget:</span>{" "}
                    {formatPrice(collab.budget, collab.currency, locale)}
                  </span>
                )}
                {collab.deadline && (
                  <span>
                    <span className="font-medium text-foreground">Timeline:</span>{" "}
                    {new Date(collab.deadline).toLocaleDateString(locale, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                {collab.packageTitle && (
                  <span>{collab.packageTitle}</span>
                )}
              </div>
            </div>
          </div>
          {!(viewAs === "brand" && collab.status === "pending") && (
            <CollabStatusBadge status={collab.status} />
          )}
        </div>

        {/* Expandable message */}
        {collab.message && (
          <div>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {expanded ? t("collab.hideMessage") : t("collab.viewMessage")}
            </button>
            {expanded && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {collab.message}
              </p>
            )}
          </div>
        )}

        {/* Decline reason */}
        {collab.status === "declined" && collab.declinedReason && (
          <p className="text-sm text-destructive">
            {t("collab.declineReason")}: {collab.declinedReason}
          </p>
        )}

        {/* Accepted — link to collaboration workspace or create one */}
        {collab.status === "accepted" && (
          <div className="pt-1">
            {collab.collaborationWorkspaceId ? (
              <Link href={`/deal-workspace/${collab.collaborationWorkspaceId}`}>
                <Button size="sm" className="w-full cursor-pointer">
                  <Rocket className="size-3.5" />
                  {t("collab.launchWorkspace")}
                </Button>
              </Link>
            ) : (
              <Button
                size="sm"
                className="w-full cursor-pointer"
                disabled={launching}
                onClick={async () => {
                  setLaunching(true);
                  const result = await launchCollaborationWorkspace(collab.id);
                  if (result.success && result.collaborationWorkspaceId) {
                    router.push(
                      `/deal-workspace/${result.collaborationWorkspaceId}`,
                    );
                  } else {
                    onUpdated();
                  }
                  setLaunching(false);
                }}
              >
                {launching ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Rocket className="size-3.5" />
                )}
                {t("collab.launchWorkspace")}
              </Button>
            )}
          </div>
        )}

        {/* Creator actions for pending requests */}
        {viewAs === "creator" && collab.status === "pending" && (
          <div className="flex flex-col gap-2 pt-1">
            {declining ? (
              <div className="space-y-2">
                <Input
                  placeholder={t("collab.declineReasonPlaceholder")}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={loading}
                    onClick={handleDecline}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="size-3 animate-spin" />}
                    {t("collab.confirmDecline")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeclining(false)}
                    className="flex-1"
                  >
                    {t("collab.cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={loading}
                    onClick={handleAccept}
                    className="flex-1 cursor-pointer"
                  >
                    {loading && <Loader2 className="size-3 animate-spin" />}
                    {t("collab.accept")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeclining(true)}
                    className="flex-1 cursor-pointer"
                  >
                    {t("collab.decline")}
                  </Button>
                </div>
                <p className="mt-4 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  Accepting will take you to the deal workspace to review details before finalizing.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
