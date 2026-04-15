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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useTranslation } from "@/i18n";
import { X, Loader2 } from "lucide-react";
import type { DealWithParties } from "@/app/(app)/deals/actions";

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
  const [deliverables, setDeliverables] = useState(deal.deliverables ?? "");
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
      deliverables,
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
        className="flex w-full flex-col overflow-hidden p-0 sm:max-w-md"
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

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dealTitle">{t("deal.titleLabel")}</Label>
            <Input
              id="dealTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("deal.deliverables")}</Label>
            <RichTextEditor
              value={deliverables}
              onChange={setDeliverables}
              placeholder={t("deal.deliverablesPlaceholder")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="timeline">{t("deal.timeline")}</Label>
              <Input
                id="timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder={t("deal.timelinePlaceholder")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("deal.notes")}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("deal.notesPlaceholder")}
              className="min-h-16"
            />
          </div>
        </div>

        <div className="shrink-0 border-t p-4">
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
