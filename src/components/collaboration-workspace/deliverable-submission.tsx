"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitDeliverable } from "@/app/(app)/collaboration-workspace/actions";
import {
  deliverableSubmissionSchema,
  type DeliverableSubmissionValues,
} from "@/lib/validations/collaboration-workspace";
import { Loader2, Upload, ExternalLink, Clock } from "lucide-react";

function getDaysUntil(date: Date | null): string | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  if (diff < 0) return "Overdue";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days} days left`;
}

function getDomainFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

interface DeliverableSubmissionProps {
  collaborationId: string;
  dueDate?: Date | null;
  onSuccess: () => void;
}

export function DeliverableSubmission({
  collaborationId,
  dueDate,
  onSuccess,
}: DeliverableSubmissionProps) {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DeliverableSubmissionValues>({
    resolver: zodResolver(deliverableSubmissionSchema),
    defaultValues: {
      contentUrl: "",
      note: "",
    },
  });

  const contentUrl = watch("contentUrl");
  const urlDomain = contentUrl ? getDomainFromUrl(contentUrl) : null;
  const dueDateLabel = getDaysUntil(dueDate ?? null);

  const onSubmit = async (data: DeliverableSubmissionValues) => {
    setSaving(true);
    setServerError("");
    const result = await submitDeliverable(collaborationId, data);
    if (result.success) {
      onSuccess();
    } else {
      setServerError("Failed to submit deliverable. Please try again.");
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="size-4" />
            Submit Deliverable
          </CardTitle>
          {dueDateLabel && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {dueDateLabel}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contentUrl">Content URL *</Label>
            <Input
              id="contentUrl"
              type="url"
              placeholder="https://..."
              {...register("contentUrl")}
            />
            {errors.contentUrl && (
              <p className="text-xs text-destructive">
                {errors.contentUrl.message}
              </p>
            )}
            {/* URL preview */}
            {urlDomain && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                <ExternalLink className="size-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{urlDomain}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Any additional notes about your submission..."
              {...register("note")}
            />
            {errors.note && (
              <p className="text-xs text-destructive">
                {errors.note.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="cursor-pointer"
            >
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              Submit Deliverable
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
