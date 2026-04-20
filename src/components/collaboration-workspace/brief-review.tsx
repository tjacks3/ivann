"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  confirmDeliverable,
  requestBriefChanges,
} from "@/app/(app)/collaboration-workspace/actions";
import type { BriefValues } from "@/lib/validations/collaboration-workspace";
import {
  Loader2,
  FileText,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

interface BriefReviewProps {
  collaborationId: string;
  briefData: BriefValues;
  onSuccess: () => void;
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
}: BriefReviewProps) {
  const [saving, setSaving] = useState(false);
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [changeMessage, setChangeMessage] = useState("");
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
        <div className="space-y-3">
          {BRIEF_FIELDS.map(({ key, label }) => {
            const value = briefData[key];
            if (!value) return null;
            return (
              <div key={key} className="rounded-lg border p-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{value}</p>
              </div>
            );
          })}
        </div>

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
        {!showChangeRequest && (
          <div className="flex gap-2">
            <Button
              onClick={handleConfirm}
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
        )}
      </CardContent>
    </Card>
  );
}
