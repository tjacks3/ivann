"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DynamicListInput } from "@/components/ui/dynamic-list-input";
import { useTranslation } from "@/i18n";
import { X, Loader2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import type { DealWithParties } from "@/app/(app)/deals/actions";

function parseDeliverables(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((s) => typeof s === "string" && s.trim());
  } catch {
    return value.split("\n").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

interface DealEditSheetProps {
  deal: DealWithParties;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    title: string;
    deliverables: string;
    budget: number | undefined;
    timeline: string;
    notes: string;
  }) => Promise<void>;
}

export function DealEditSheet({
  deal,
  open,
  onOpenChange,
  onSave,
}: DealEditSheetProps) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(deal.title);
  const [description, setDescription] = useState(deal.notes ?? "");
  const [deliverableItems, setDeliverableItems] = useState<string[]>(
    parseDeliverables(deal.deliverables),
  );
  const [budgetDollars, setBudgetDollars] = useState(
    deal.budget ? (deal.budget / 100).toString() : "",
  );
  const [timeline, setTimeline] = useState(deal.timeline ?? "");
  const [notes, setNotes] = useState(deal.notes ?? "");

  const handleSave = async () => {
    setSaving(true);
    const budgetCents = budgetDollars
      ? Math.round(parseFloat(budgetDollars) * 100)
      : undefined;
    await onSave({
      title,
      deliverables: deliverableItems.join("\n"),
      budget: budgetCents,
      timeline,
      notes,
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <SheetTitle className="text-base font-semibold">
            {t("deal.editProposal")}
          </SheetTitle>
          <SheetClose>
            <X className="size-5" />
          </SheetClose>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2.5">
            <Label htmlFor="dealTitle">{t("deal.titleLabel")}</Label>
            <Input
              id="dealTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2.5">
            <Label htmlFor="description">{t("collab.form.description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("collab.form.descriptionPlaceholder")}
              className="min-h-20"
            />
          </div>

          {/* Deliverables */}
          <div className="space-y-2.5">
            <Label>{t("deal.deliverables")}</Label>
            <DynamicListInput
              items={deliverableItems}
              onChange={setDeliverableItems}
              placeholder={t("collab.form.deliverablePlaceholder")}
              addLabel={t("collab.form.addDeliverable")}
              hint={t("collab.form.deliverablesHint")}
            />
          </div>

          {/* Budget */}
          <div className="space-y-2.5">
            <Label htmlFor="budget">{t("deal.budget")}</Label>
            <Input
              id="budget"
              type="number"
              min={0}
              step={0.01}
              value={budgetDollars}
              onChange={(e) => setBudgetDollars(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Timeline */}
          <div className="space-y-2.5">
            <Label>{t("deal.timeline")}</Label>
            <DatePicker
              value={timeline}
              onChange={(val) => setTimeline(val)}
              placeholder={t("deal.timelinePlaceholder")}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2.5">
            <Label htmlFor="notes">{t("collab.form.message")}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("collab.form.messagePlaceholder")}
              className="min-h-16"
            />
          </div>
        </div>

        <div className="shrink-0 border-t p-6">
          <Button
            className="w-full cursor-pointer"
            onClick={handleSave}
            disabled={saving || !title.trim()}
          >
            {saving && <Loader2 className="size-3.5 animate-spin" />}
            {t("deal.saveChanges")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
