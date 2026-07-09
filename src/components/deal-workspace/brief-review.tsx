"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  confirmDeliverable,
  requestBriefChanges,
} from "@/app/(app)/deal-workspace/actions";
import type { BriefValues } from "@/lib/validations/deal-workspace";
import {
  Loader2,
  FileText,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface BriefReviewProps {
  collaborationId: string;
  briefData: BriefValues;
  onSuccess: () => void;
  paymentStatus?: string | null;
}

const BRIEF_FIELDS: { key: keyof BriefValues; label: string }[] = [
  { key: "campaignGoal", label: "Campaign Goal" },
  { key: "productOrService", label: "Product / Service" },
  { key: "requiredMentions", label: "Required Mentions" },
  { key: "tagsHashtags", label: "Tags / Hashtags" },
  { key: "location", label: "Location" },
  { key: "postingWindowStart", label: "Posting Window Start" },
  { key: "postingWindowEnd", label: "Posting Window End" },
  { key: "specialInstructions", label: "Special Instructions" },
  { key: "restrictions", label: "Restrictions" },
];

export function BriefReview({
  collaborationId,
  briefData,
  onSuccess,
  paymentStatus,
}: BriefReviewProps) {
  const [saving, setSaving] = useState(false);
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [showConfirmNote, setShowConfirmNote] = useState(false);
  const [changeMessage, setChangeMessage] = useState("");
  const [confirmNote, setConfirmNote] = useState("");
  const [serverError, setServerError] = useState("");

  const handleConfirm = async () => {
    setSaving(true);
    setServerError("");
    const result = await confirmDeliverable(collaborationId);
    if (result.success) {
      onSuccess();
    } else {
      setServerError("Failed to confirm. Please try again.");
    }
    setSaving(false);
  };

  const handleRequestChanges = async () => {
    if (!changeMessage.trim()) return;
    setSaving(true);
    setServerError("");
    const result = await requestBriefChanges(collaborationId, changeMessage);
    if (result.success) {
      setShowChangeRequest(false);
      setChangeMessage("");
      onSuccess();
    } else {
      setServerError("Failed to submit request. Please try again.");
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="size-4" />
          Campaign Brief
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Brief fields */}
        <div className="rounded-xl bg-muted/30 p-4">
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {BRIEF_FIELDS.map(({ key, label }) => {
              const value = briefData[key];
              if (!value) return null;
              return (
                <div
                  key={key}
                  className="space-y-1 p-2"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment status indicator */}
        {paymentStatus && (
          <div className="flex items-center gap-2">
            {paymentStatus === "funded" ? (
              <Badge variant="outline" className="border-primary/30 text-primary">
                <ShieldCheck className="mr-1 size-3" />
                Payment secured
              </Badge>
            ) : paymentStatus === "unpaid" ? (
              <Badge variant="outline" className="border-amber-500/30 text-amber-600">
                <AlertTriangle className="mr-1 size-3" />
                Payment not yet funded
              </Badge>
            ) : null}
          </div>
        )}

        {/* Confirm with optional note */}
        {showConfirmNote && (
          <div className="space-y-2 rounded-lg border border-dashed p-3">
            <Textarea
              value={confirmNote}
              onChange={(e) => setConfirmNote(e.target.value)}
              placeholder="Add a note for the brand (optional)..."
              className="min-h-16"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowConfirmNote(false);
                  setConfirmNote("");
                }}
                className="cursor-pointer"
              >
                Skip Note
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={saving}
                className="cursor-pointer"
              >
                {saving && <Loader2 className="size-3 animate-spin" />}
                Confirm & Start
              </Button>
            </div>
          </div>
        )}

        {/* Change request section */}
        {showChangeRequest && (
          <div className="space-y-2 rounded-lg border border-dashed p-3">
            <Textarea
              value={changeMessage}
              onChange={(e) => setChangeMessage(e.target.value)}
              placeholder="Describe what changes you need to the brief..."
              className="min-h-20"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowChangeRequest(false);
                  setChangeMessage("");
                }}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRequestChanges}
                disabled={saving || !changeMessage.trim()}
                className="cursor-pointer"
              >
                {saving && <Loader2 className="size-3 animate-spin" />}
                Send Request
              </Button>
            </div>
          </div>
        )}

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        {/* Action buttons */}
        {!showChangeRequest && !showConfirmNote && (
          <div className="space-y-3">
            {paymentStatus !== "funded" && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-50 px-3 py-2 dark:bg-amber-900/10">
                <AlertTriangle className="size-3.5 shrink-0 text-amber-600" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Work cannot start until the brand funds the deal. You&rsquo;ll be notified once payment is secured.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              {paymentStatus === "funded" && (
                <Button
                  onClick={() => setShowConfirmNote(true)}
                  disabled={saving}
                  className="cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-3.5" />
                  )}
                  Confirm &amp; Start Working
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowChangeRequest(true)}
                disabled={saving}
                className="cursor-pointer"
              >
                <MessageSquare className="size-3.5" />
                Request Changes
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
