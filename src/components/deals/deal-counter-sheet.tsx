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
import { DeliverablesList } from "@/components/packages/deliverables-list";
import { formatPrice } from "@/lib/currency";
import { useTranslation } from "@/i18n";
import { X, Loader2, DollarSign, Clock, FileText } from "lucide-react";
import type { DealWithParties } from "@/app/(app)/deals/actions";

interface DealCounterSheetProps {
  deal: DealWithParties;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    deliverables: string;
    budget: number | undefined;
    timeline: string;
    notes: string;
  }) => Promise<void>;
}

export function DealCounterSheet({
  deal,
  open,
  onOpenChange,
  onSubmit,
}: DealCounterSheetProps) {
  const { t, locale } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [deliverableItems, setDeliverableItems] = useState<string[]>(() => {
    if (!deal.deliverables) return [];
    try {
      const parsed = JSON.parse(deal.deliverables);
      if (Array.isArray(parsed)) return parsed.filter((s: unknown) => typeof s === "string" && (s as string).trim());
    } catch {
      return deal.deliverables.split("\n").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  });
  const [budgetDollars, setBudgetDollars] = useState(
    deal.budget ? (deal.budget / 100).toString() : "",
  );
  const [timeline, setTimeline] = useState(deal.timeline ?? "");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    setSaving(true);
    const budgetCents = budgetDollars
      ? Math.round(parseFloat(budgetDollars) * 100)
      : undefined;
    await onSubmit({
      deliverables: JSON.stringify(deliverableItems),
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
            {t("deal.counterProposal")}
          </SheetTitle>
          <SheetClose>
            <X className="size-5" />
          </SheetClose>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Original proposal (read-only) */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("deal.counter.originalProposal")}
            </p>
            <div className="space-y-3 rounded-lg border border-dashed bg-muted/30 p-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="size-3" />
                  {t("deal.deliverables")}
                </div>
                <div className="mt-1">
                  {deal.deliverables ? (
                    <DeliverablesList value={deal.deliverables} />
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("deal.notSpecified")}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <DollarSign className="size-3" />
                    {t("deal.budget")}
                  </div>
                  <p className="mt-0.5 text-sm font-medium">
                    {deal.budget ? formatPrice(deal.budget, deal.currency, locale) : t("deal.notSpecified")}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {t("deal.timeline")}
                  </div>
                  <p className="mt-0.5 text-sm">{deal.timeline || t("deal.notSpecified")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Counter-proposal fields */}
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("deal.counter.yourChanges")}
            </p>

            <div className="space-y-2.5.5">
              <Label>{t("deal.deliverables")}</Label>
              <DynamicListInput
                items={deliverableItems}
                onChange={setDeliverableItems}
                placeholder={t("deal.counter.deliverablesPlaceholder")}
                addLabel="Add"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label htmlFor="counterBudget">{t("deal.budget")}</Label>
                <Input
                  id="counterBudget"
                  type="number"
                  min={0}
                  step={0.01}
                  value={budgetDollars}
                  onChange={(e) => setBudgetDollars(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="counterTimeline">{t("deal.timeline")}</Label>
                <Input
                  id="counterTimeline"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder={t("deal.timelinePlaceholder")}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="counterNotes">{t("deal.counter.notesLabel")}</Label>
              <Textarea
                id="counterNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("deal.counter.notesPlaceholder")}
                className="min-h-16"
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t p-4">
          <Button
            className="w-full cursor-pointer"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving && <Loader2 className="size-3.5 animate-spin" />}
            {t("deal.counter.submit")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
