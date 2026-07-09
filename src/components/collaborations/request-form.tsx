"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DynamicListInput } from "@/components/ui/dynamic-list-input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { useTranslation } from "@/i18n";
import { collaborationRequestSchema } from "@/lib/validations/collaboration";
import type { CollaborationRequestValues } from "@/lib/validations/collaboration";
import { createDeal } from "@/app/(app)/deals/actions";
import { getCurrencyForLocale, fromCents, toCents } from "@/lib/currency";
import type { Package } from "@/db/schema/packages";

const OFFER_TYPES = [
  "ugc",
  "sponsored_post",
  "story",
  "reel",
  "video",
  "bundle",
  "custom",
] as const;

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
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [deliverableItems, setDeliverableItems] = useState<string[]>([]);

  const currency = getCurrencyForLocale(locale);

  const preSelectedPkg = availablePackages?.find((p) => p.id === preSelectedPackageId);

  const form = useForm<CollaborationRequestValues>({
    resolver: zodResolver(collaborationRequestSchema),
    defaultValues: {
      creatorId,
      packageId: preSelectedPackageId,
      title: preSelectedPkg ? preSelectedPkg.title : "",
      description: "",
      deliverables: [],
      type: preSelectedPkg?.type as CollaborationRequestValues["type"] ?? undefined,
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
      setValue("type", undefined);
      setDeliverableItems([]);
      setValue("deliverables", []);
    } else {
      const pkg = availablePackages?.find((p) => p.id === pkgId);
      if (pkg) {
        setValue("packageId", pkg.id);
        setValue("title", pkg.title);
        setValue("budget", pkg.priceInCents);
        setValue("type", pkg.type as CollaborationRequestValues["type"]);
        const pkgDeliverables = pkg.deliverables
          ? pkg.deliverables.split("\n").map((s) => s.trim()).filter(Boolean)
          : [];
        setDeliverableItems(pkgDeliverables);
        setValue("deliverables", pkgDeliverables);
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

    const deliverablesText = deliverableItems.length > 0
      ? deliverableItems.join("\n")
      : data.description ?? "";

    const result = await createDeal({
      creatorId: data.creatorId,
      title: data.title,
      deliverables: deliverablesText || undefined,
      budget: data.budget ?? undefined,
      currency: data.currency,
      timeline: data.deadline ?? undefined,
      notes: data.message ?? undefined,
    });

    if (result.success) {
      router.push(`/deals/${result.dealId}`);
    } else if (result.error === "UNAUTHORIZED") {
      setServerError(t("collab.form.unauthorized"));
    } else {
      setServerError(t("collab.form.error"));
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
      {/* Scrollable fields */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Package select */}
        {availablePackages && availablePackages.length > 0 && (
          <div className="space-y-2.5">
            <Label>{t("collab.form.package")}</Label>
            <Select
              value={selectedPackageId ?? "custom"}
              onValueChange={(v) => { if (v) handlePackageChange(v); }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[var(--anchor-width)] w-max">
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

        {/* Title */}
        <div className="space-y-2.5">
          <Label htmlFor="title">{t("collab.form.requestTitle")}</Label>
          <Input id="title" {...register("title")} placeholder={t("collab.form.titlePlaceholder")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        {/* Type */}
        <div className="space-y-2.5">
          <Label>{t("collab.form.type")}</Label>
          <Select
            value={watch("type") ?? "custom"}
            onValueChange={(v) => setValue("type", v as CollaborationRequestValues["type"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OFFER_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`packages.type.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2.5">
          <Label htmlFor="description">{t("collab.form.description")}</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder={t("collab.form.descriptionPlaceholder")}
            className="min-h-20"
          />
        </div>

        {/* Deliverables */}
        <div className="space-y-2.5">
          <Label>{t("collab.form.deliverables")}</Label>
          <DynamicListInput
            items={deliverableItems}
            onChange={(items) => {
              setDeliverableItems(items);
              setValue("deliverables", items);
            }}
            placeholder={t("collab.form.deliverablePlaceholder")}
            addLabel={t("collab.form.addDeliverable")}
            hint={t("collab.form.deliverablesHint")}
          />
        </div>

        {/* Budget + Deadline */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
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

          <div className="space-y-2.5">
            <Label>{t("collab.form.deadline")}</Label>
            <DatePicker
              value={watch("deadline") ?? ""}
              onChange={(val) => setValue("deadline", val, { shouldDirty: true })}
              placeholder="Pick a deadline"
              className="min-w-0"
            />
          </div>
        </div>

        {/* Message / Notes */}
        <div className="space-y-2.5">
          <Label htmlFor="message">{t("collab.form.message")}</Label>
          <Textarea
            id="message"
            value={watch("message") ?? ""}
            onChange={(e) => setValue("message", e.target.value)}
            placeholder={t("collab.form.messagePlaceholder")}
            className="min-h-20"
          />
        </div>

        {serverError && (
          <p className="text-xs text-destructive">{serverError}</p>
        )}
      </div>

      {/* Fixed footer */}
      <div className="shrink-0 border-t bg-background p-6">
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
