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
import { OngoingPartnershipFields } from "./ongoing-partnership-fields";
import { LocalBoostFields } from "./local-boost-fields";
import { Loader2 } from "lucide-react";
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

export function PackageForm({ pkg, templateDefaults, templateId, onClose, onSaved }: PackageFormProps) {
  const { t, locale } = useTranslation();
  const [saving, setSaving] = useState(false);
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
    handleSubmit,
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

  const onSubmit = async (data: PackageFormValues) => {
    setSaving(true);
    setServerError(null);

    const result = isEditing
      ? await updatePackage(pkg!.id, data)
      : await createPackage(data);

    if (result.success) {
      onSaved();
    } else {
      setServerError(t("packages.form.error"));
    }

    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-1 flex-col overflow-hidden"
    >
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

        <div className="grid grid-cols-2 gap-3">
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
            <Label>{t("packages.form.status")}</Label>
            <Select
              value={watch("status")}
              onValueChange={(val) =>
                setValue("status", val as PackageFormValues["status"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">
                  {t("packages.status.draft")}
                </SelectItem>
                <SelectItem value="active">
                  {t("packages.status.active")}
                </SelectItem>
                <SelectItem value="archived">
                  {t("packages.status.archived")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
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

      {/* Fixed footer */}
      <div className="shrink-0 border-t bg-background p-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {t("packages.form.cancel")}
          </Button>
          <Button type="submit" disabled={saving} className="flex-1">
            {saving && <Loader2 className="size-3 animate-spin" />}
            {saving ? t("packages.form.saving") : t("packages.form.save")}
          </Button>
        </div>
      </div>
    </form>
  );
}
