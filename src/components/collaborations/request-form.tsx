"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/i18n";
import { collaborationRequestSchema } from "@/lib/validations/collaboration";
import type { CollaborationRequestValues } from "@/lib/validations/collaboration";
import { createCollaborationRequest } from "@/app/(app)/collaborations/actions";
import { getCurrencyForLocale, fromCents, toCents } from "@/lib/currency";
import type { Package } from "@/db/schema/packages";

interface RequestFormProps {
  creatorId: string;
  creatorName: string;
  packages?: Package[];
  preSelectedPackageId?: string;
  onClose: () => void;
}

export function RequestForm({
  creatorId,
  creatorName,
  packages: availablePackages,
  preSelectedPackageId,
  onClose,
}: RequestFormProps) {
  const { t, locale } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const currency = getCurrencyForLocale(locale);

  const preSelectedPkg = availablePackages?.find((p) => p.id === preSelectedPackageId);

  const form = useForm<CollaborationRequestValues>({
    resolver: zodResolver(collaborationRequestSchema),
    defaultValues: {
      creatorId,
      packageId: preSelectedPackageId,
      title: preSelectedPkg ? `Collaboration: ${preSelectedPkg.title}` : "",
      message: "",
      budget: preSelectedPkg?.priceInCents ?? undefined,
      currency,
      deadline: "",
    },
  });

  const { register, formState: { errors }, setValue, watch, handleSubmit } = form;

  const selectedPackageId = watch("packageId");

  const handlePackageChange = (pkgId: string) => {
    if (pkgId === "custom") {
      setValue("packageId", undefined);
      setValue("title", "");
      setValue("budget", undefined);
    } else {
      const pkg = availablePackages?.find((p) => p.id === pkgId);
      if (pkg) {
        setValue("packageId", pkg.id);
        setValue("title", `Collaboration: ${pkg.title}`);
        setValue("budget", pkg.priceInCents);
      }
    }
  };

  const budgetCents = watch("budget");
  const budgetDisplay = budgetCents ? fromCents(budgetCents, currency).toString() : "";

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setValue("budget", isNaN(val) ? undefined : toCents(val, currency), { shouldValidate: true });
  };

  const onSubmit = async (data: CollaborationRequestValues) => {
    setSaving(true);
    setServerError(null);

    const result = await createCollaborationRequest(data);

    if (result.success) {
      setSuccess(true);
    } else if (result.error === "UNAUTHORIZED") {
      setServerError(t("collab.form.unauthorized"));
    } else {
      setServerError(t("collab.form.error"));
    }

    setSaving(false);
  };

  if (success) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
        <CheckCircle2 className="size-10 text-green-500" />
        <h3 className="font-semibold">{t("collab.form.successTitle")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("collab.form.successDescription", { name: creatorName })}
        </p>
        <Button variant="outline" onClick={onClose}>
          {t("collab.form.close")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
      {/* Scrollable fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Package select */}
        {availablePackages && availablePackages.length > 0 && (
          <div className="space-y-1.5">
            <Label>{t("collab.form.package")}</Label>
            <Select
              value={selectedPackageId ?? "custom"}
              onValueChange={(v) => { if (v) handlePackageChange(v); }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">{t("collab.form.customRequest")}</SelectItem>
                {availablePackages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="title">{t("collab.form.requestTitle")}</Label>
          <Input id="title" {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="message">{t("collab.form.message")}</Label>
          <Textarea
            id="message"
            rows={4}
            placeholder={t("collab.form.messagePlaceholder")}
            {...register("message")}
          />
          {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="budget">{t("collab.form.budget")}</Label>
            <div className="flex">
              <span className="flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground uppercase">
                {currency}
              </span>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                className="rounded-l-none"
                value={budgetDisplay}
                onChange={handleBudgetChange}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deadline">{t("collab.form.deadline")}</Label>
            <Input
              id="deadline"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              {...register("deadline")}
            />
          </div>
        </div>

        {serverError && (
          <p className="text-xs text-destructive">{serverError}</p>
        )}
      </div>

      {/* Fixed footer */}
      <div className="shrink-0 border-t bg-background p-4">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            {t("collab.form.cancel")}
          </Button>
          <Button type="submit" disabled={saving} className="flex-1">
            {saving && <Loader2 className="size-3 animate-spin" />}
            {t("collab.form.send")}
          </Button>
        </div>
      </div>
    </form>
  );
}
