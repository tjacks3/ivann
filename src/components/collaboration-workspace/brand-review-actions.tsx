"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  approveDeliverable,
  requestRevision,
} from "@/app/(app)/collaboration-workspace/actions";
import {
  Loader2,
  Eye,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

interface BrandReviewActionsProps {
  collaborationId: string;
  submittedUrl: string | null;
  submittedNote: string | null;
  onSuccess: () => void;
}

export function BrandReviewActions({
  collaborationId,
  submittedUrl,
  submittedNote,
  onSuccess,
}: BrandReviewActionsProps) {
  const [saving, setSaving] = useState(false);
  const [showRevisionRequest, setShowRevisionRequest] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [confirmApprove, setConfirmApprove] = useState(false);

  const handleApprove = async () => {
    setSaving(true);
    setServerError("");
    const result = await approveDeliverable(collaborationId);
    if (result.success) {
      onSuccess();
    } else {
      setServerError("Failed to approve. Please try again.");
    }
    setSaving(false);
    setConfirmApprove(false);
  };

  const handleRequestRevision = async () => {
    if (!revisionMessage.trim()) return;
    setSaving(true);
    setServerError("");
    const result = await requestRevision(collaborationId, revisionMessage);
    if (result.success) {
      setShowRevisionRequest(false);
      setRevisionMessage("");
      onSuccess();
    } else {
      setServerError("Failed to submit revision request. Please try again.");
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="size-4" />
          Review Deliverable
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Submitted content */}
        {submittedUrl && (
          <div className="rounded-lg border p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Submitted Content
            </p>
            <a
              href={submittedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              {submittedUrl}
              <ExternalLink className="size-3" />
            </a>
          </div>
        )}

        {submittedNote && (
          <div className="rounded-lg border p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Creator Note
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{submittedNote}</p>
          </div>
        )}

        {/* Revision request form */}
        {showRevisionRequest && (
          <div className="space-y-2 rounded-lg border border-dashed p-3">
            <Textarea
              value={revisionMessage}
              onChange={(e) => setRevisionMessage(e.target.value)}
              placeholder="Describe what changes you need..."
              className="min-h-20"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRevisionRequest(false);
                  setRevisionMessage("");
                }}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRequestRevision}
                disabled={saving || !revisionMessage.trim()}
                className="cursor-pointer"
              >
                {saving && <Loader2 className="size-3 animate-spin" />}
                Request Revision
              </Button>
            </div>
          </div>
        )}

        {/* Approval confirmation */}
        {confirmApprove && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
            <p className="text-sm font-medium">
              Approve this deliverable and mark the collaboration as complete?
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmApprove(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={saving}
                className="cursor-pointer"
              >
                {saving && <Loader2 className="size-3 animate-spin" />}
                Confirm Approval
              </Button>
            </div>
          </div>
        )}

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        {/* Action buttons */}
        {!showRevisionRequest && !confirmApprove && (
          <div className="flex gap-2">
            <Button
              onClick={() => setConfirmApprove(true)}
              disabled={saving}
              className="cursor-pointer"
            >
              <CheckCircle2 className="size-3.5" />
              Approve Deliverable
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRevisionRequest(true)}
              disabled={saving}
              className="cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              Request Revision
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
