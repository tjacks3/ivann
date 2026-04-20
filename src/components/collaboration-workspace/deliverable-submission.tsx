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
import { Loader2, Upload } from "lucide-react";

interface DeliverableSubmissionProps {
  collaborationId: string;
  onSuccess: () => void;
}

export function DeliverableSubmission({
  collaborationId,
  onSuccess,
}: DeliverableSubmissionProps) {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliverableSubmissionValues>({
    resolver: zodResolver(deliverableSubmissionSchema),
    defaultValues: {
      contentUrl: "",
      note: "",
    },
  });

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
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="size-4" />
          Submit Deliverable
        </CardTitle>
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
