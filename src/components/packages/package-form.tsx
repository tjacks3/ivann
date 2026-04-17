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
import { DynamicListInput } from "@/components/ui/dynamic-list-input";
import { Progress } from "@/components/ui/progress";
import { OngoingPartnershipFields } from "./ongoing-partnership-fields";
import { LocalBoostFields } from "./local-boost-fields";
import { Loader2, Lightbulb } from "lucide-react";
import { useTranslation } from "@/i18n";
import { packageFormSchema } from "@/lib/validations/package";
import type { PackageFormValues } from "@/lib/validations/package";
import { createPackage, updatePackage } from "@/app/(app)/packages/actions";
import { getCurrencyForLocale, fromCents, toCents } from "@/lib/currency";
import type { Package } from "@/db/schema/packages";

function parseDeliverables(value: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed))
      return parsed.filter((s) => typeof s === "string" && s.trim());
  } catch {
    // Legacy plain text — split by newlines or return as single item
    return value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

const PACKAGE_TYPES = [
  "ugc",
  "sponsored_post",
  "story",
  "reel",
  "video",
  "bundle",
  "custom",
] as const;

interface TemplateDefaults {
  title?: string;
  description?: string;
  type?: PackageFormValues["type"];
  deliverables?: string[];
  priceInCents?: number;
  deliveryDays?: number;
  revisions?: number;
}

interface PackageFormProps {
  pkg?: Package;
  templateDefaults?: TemplateDefaults;
  templateId?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function PackageForm({ pkg, templateDefaults, templateId, onClose: _onClose, onSaved }: PackageFormProps) {
  const { t, locale } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = !!pkg;

  const currency = pkg?.currency ?? getCurrencyForLocale(locale);

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      title: pkg?.title ?? templateDefaults?.title ?? "",
      description: pkg?.description ?? templateDefaults?.description ?? "",
      deliverables: pkg?.deliverables ?? (templateDefaults?.deliverables ? JSON.stringify(templateDefaults.deliverables) : ""),
      type: (pkg?.type as PackageFormValues["type"]) ?? templateDefaults?.type ?? "custom",
      priceInCents: pkg?.priceInCents ?? templateDefaults?.priceInCents ?? 0,
      currency,
      deliveryDays: pkg?.deliveryDays ?? templateDefaults?.deliveryDays ?? undefined,
      revisions: pkg?.revisions ?? templateDefaults?.revisions ?? 1,
      status: (pkg?.status as PackageFormValues["status"]) ?? "draft",
    },
  });

  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const priceDisplay = watch("priceInCents")
    ? fromCents(watch("priceInCents"), currency).toString()
    : "";

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val)) {
      setValue("priceInCents", 0, { shouldValidate: true });
    } else {
      setValue("priceInCents", toCents(val, currency), {
        shouldValidate: true,
      });
    }
  };

  const [savingAs, setSavingAs] = useState<"draft" | "publish" | null>(null);

  // Completeness calculation
  const watchedTitle = watch("title");
  const watchedDesc = watch("description");
  const watchedDeliverables = watch("deliverables");
  const watchedPrice = watch("priceInCents");
  const watchedDeliveryDays = watch("deliveryDays");

  const completenessFields = [
    !!watchedTitle?.trim(),
    !!watchedDesc?.trim(),
    !!watchedDeliverables?.trim() && watchedDeliverables !== "[]",
    watchedPrice > 0,
    !!watchedDeliveryDays && watchedDeliveryDays > 0,
  ];
  const completeness = Math.round(
    (completenessFields.filter(Boolean).length / completenessFields.length) * 100,
  );
  const canPublish = completeness === 100;

  const handleSave = async (status: "draft" | "active") => {
    setSavingAs(status === "draft" ? "draft" : "publish");
    setServerError(null);
    setValue("status", status);

    // Trigger validation manually
    const isValid = await form.trigger();
    if (!isValid && status === "active") {
      setSavingAs(null);
      return;
    }

    const data = form.getValues();
    // For drafts, relax price validation
    if (status === "draft" && data.priceInCents === 0) {
      data.priceInCents = 100; // minimum to pass validation, will show as draft
    }

    const result = isEditing
      ? await updatePackage(pkg!.id, { ...data, status })
      : await createPackage({ ...data, status });

    if (result.success) {
      onSaved();
    } else {
      setServerError(t("packages.form.error"));
    }

    setSavingAs(null);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Scrollable fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">{t("packages.form.title")}</Label>
          <Input id="title" {...register("title")} />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">{t("packages.form.description")}</Label>
          <Textarea
            id="description"
            rows={3}
            placeholder={t("packages.form.descriptionPlaceholder")}
            {...register("description")}
          />
        </div>

        <div className="space-y-1.5 mb-8">
          <Label>{t("packages.form.deliverables")}</Label>
          <DynamicListInput
            items={parseDeliverables(watch("deliverables") ?? "")}
            onChange={(items) =>
              setValue("deliverables", JSON.stringify(items), {
                shouldValidate: true,
              })
            }
            placeholder={t("packages.form.deliverablesPlaceholder")}
            addLabel={t("packages.form.addDeliverable")}
            hint={t("packages.form.deliverablesHint")}
          />
        </div>

        {/* Local Boost conditional fields */}
        {templateId === "local_boost" && (
          <LocalBoostFields
            initialDeliverables={parseDeliverables(watch("deliverables") ?? "")}
            onDeliverablesChange={(items) => {
              setValue("deliverables", JSON.stringify(items));
            }}
            onDescriptionChange={(desc) => {
              setValue("description", desc);
            }}
          />
        )}

        {/* Ongoing Partnership conditional fields */}
        {templateId === "ongoing_partnership" && (
          <OngoingPartnershipFields
            basePriceInCents={templateDefaults?.priceInCents ?? pkg?.priceInCents ?? 0}
            onSummaryChange={(summary) => {
              setValue("description", summary);
            }}
            onDeliveryDaysChange={(days) => {
              setValue("deliveryDays", days);
            }}
            onDiscountedPriceChange={(cents) => {
              if (cents !== null) {
                setValue("priceInCents", cents);
              }
            }}
          />
        )}

        <div className="space-y-1.5">
          <Label>{t("packages.form.type")}</Label>
          <Select
            value={watch("type")}
            onValueChange={(val) =>
              setValue("type", val as PackageFormValues["type"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PACKAGE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`packages.type.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="price">{t("packages.form.price")}</Label>
          <div className="flex">
            <span className="flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground uppercase">
              {currency}
            </span>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="1"
              className="rounded-l-none"
              value={priceDisplay}
              onChange={handlePriceChange}
            />
          </div>
          {errors.priceInCents && (
            <p className="text-xs text-destructive">
              {errors.priceInCents.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="space-y-1.5">
            <Label htmlFor="deliveryDays">
              {t("packages.form.deliveryDays")}
            </Label>
            <Input
              id="deliveryDays"
              type="number"
              min="1"
              max="365"
              {...register("deliveryDays", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="revisions">{t("packages.form.revisions")}</Label>
            <Input
              id="revisions"
              type="number"
              min="0"
              max="10"
              {...register("revisions", { valueAsNumber: true })}
            />
          </div>
        </div>

        {serverError && (
          <p className="text-xs text-destructive">{serverError}</p>
        )}
      </div>

      {/* Fixed footer with completeness + actions */}
      <div className="shrink-0 border-t bg-background px-4 py-3 space-y-3">
        {/* Completeness meter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">
              {t("packages.form.completeness")}
            </span>
            <span className={completeness === 100 ? "font-semibold text-primary" : "text-muted-foreground"}>
              {completeness}%
            </span>
          </div>
          <Progress value={completeness} className="h-1.5" />
        </div>

        {/* Nudge */}
        {completeness < 100 && (
          <div className="flex items-start gap-2 rounded-md bg-amber-500/5 px-2.5 py-2">
            <Lightbulb className="mt-0.5 size-3 shrink-0 text-amber-600" />
            <p className="text-[11px] text-amber-700">
              {!watchedDeliverables?.trim() || watchedDeliverables === "[]"
                ? t("packages.form.nudge.deliverables")
                : !watchedDesc?.trim()
                  ? t("packages.form.nudge.description")
                  : t("packages.form.nudge.complete")}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSave("draft")}
            disabled={savingAs !== null}
            className="flex-1 cursor-pointer"
          >
            {savingAs === "draft" && <Loader2 className="size-3 animate-spin" />}
            {t("packages.form.saveDraft")}
          </Button>
          <Button
            type="button"
            onClick={() => handleSave("active")}
            disabled={savingAs !== null || !canPublish}
            className="flex-1 cursor-pointer"
          >
            {savingAs === "publish" && <Loader2 className="size-3 animate-spin" />}
            {t("packages.form.publish")}
          </Button>
        </div>
      </div>
    </div>
  );
}
