"use client";

import { useState, useCallback } from "react";
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
import { DatePicker } from "@/components/ui/date-picker";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { sendCampaignOffer } from "@/app/(app)/brand/campaigns/actions";
import { X, Loader2, AlertTriangle, DollarSign } from "lucide-react";

interface CreatorForDeal {
  creatorId: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
}

interface SendDealSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  creators: CreatorForDeal[];
  remainingBudgetInCents: number;
  onDealSent: () => void;
  onComplete: () => void;
}

export function SendDealSheet({
  open,
  onOpenChange,
  campaignId,
  creators,
  remainingBudgetInCents,
  onDealSent,
  onComplete,
}: SendDealSheetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sending, setSending] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [totalAllocatedThisSession, setTotalAllocatedThisSession] = useState(0);

  // Form fields
  const [title, setTitle] = useState("");
  const [deliverableItems, setDeliverableItems] = useState<string[]>([]);
  const [budgetDollars, setBudgetDollars] = useState("");
  const [timeline, setTimeline] = useState("");
  const [notes, setNotes] = useState("");
  const [touchedTitle, setTouchedTitle] = useState(false);
  const [touchedBudget, setTouchedBudget] = useState(false);

  const resetAll = useCallback(() => {
    setCurrentIndex(0);
    setTotalAllocatedThisSession(0);
    setCompleted(false);
    setSending(false);
    setTitle("");
    setDeliverableItems([]);
    setBudgetDollars("");
    setTimeline("");
    setNotes("");
    setTouchedTitle(false);
    setTouchedBudget(false);
  }, []);

  const resetForm = useCallback(() => {
    setTitle("");
    setDeliverableItems([]);
    setBudgetDollars("");
    setTimeline("");
    setNotes("");
    setTouchedTitle(false);
    setTouchedBudget(false);
  }, []);

  if (creators.length === 0) return null;

  const safeIndex = Math.min(currentIndex, creators.length - 1);
  const creator = creators[safeIndex];
  const total = creators.length;
  const isLast = safeIndex === total - 1;

  const parsedBudget = parseFloat(budgetDollars);
  const budgetCents =
    budgetDollars && !isNaN(parsedBudget) && parsedBudget > 0
      ? Math.round(parsedBudget * 100)
      : 0;
  const effectiveRemaining =
    remainingBudgetInCents - totalAllocatedThisSession;
  const remainingAfterThis = effectiveRemaining - budgetCents;
  const wouldExceedBudget = budgetCents > 0 && budgetCents > effectiveRemaining;
  const isBudgetNegative = budgetDollars !== "" && parsedBudget < 0;
  const isBudgetEmpty = budgetDollars.trim() === "";
  const isTitleEmpty = title.trim() === "";
  const canSend =
    !isTitleEmpty && budgetCents > 0 && !wouldExceedBudget && !isBudgetNegative;

  const initials = (creator.fullName ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSend = async () => {
    if (!canSend || sending || completed) return;
    setSending(true);

    const result = await sendCampaignOffer(campaignId, creator.creatorId, {
      allocatedBudgetInCents: budgetCents,
      title: title.trim(),
      deliverables: deliverableItems.filter(Boolean).join("\n") || undefined,
      timeline: timeline || undefined,
      notes: notes.trim() || undefined,
    });

    setSending(false);

    if (!result.success) return;

    setTotalAllocatedThisSession((prev) => prev + budgetCents);

    if (isLast) {
      // Mark completed to prevent any further interaction, then notify parent
      setCompleted(true);
      onDealSent();
      onComplete();
    } else {
      onDealSent();
      setCurrentIndex((prev) => prev + 1);
      resetForm();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Defer reset so the closing animation finishes before state changes
    setTimeout(resetAll, 300);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-base font-semibold">
              Send Deal
            </SheetTitle>
            <Badge variant="secondary" className="text-xs">
              {completed ? `${total} of ${total}` : `${safeIndex + 1} of ${total}`}
            </Badge>
          </div>
          <SheetClose onClick={handleClose}>
            <X className="size-5" />
          </SheetClose>
        </div>

        {/* Completed state — brief success before parent closes the sheet */}
        {completed && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold">All deals sent</p>
            <p className="text-xs text-muted-foreground">
              {total} deal{total !== 1 ? "s" : ""} created successfully
            </p>
          </div>
        )}

        {/* Creator mini profile + form + footer — hidden when completed */}
        {!completed && (
          <>
            <div className="flex items-center gap-3 border-b px-6 py-4">
              <Avatar className="size-10 shrink-0">
                {creator.avatarUrl && (
                  <AvatarImage
                    src={creator.avatarUrl}
                    alt={creator.fullName ?? ""}
                  />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {creator.fullName ?? "Creator"}
                </p>
                {creator.username && (
                  <p className="truncate text-xs text-muted-foreground">
                    @{creator.username}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                Creating deal {safeIndex + 1} of {total}
              </span>
            </div>

            {/* Form */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Title */}
          <div className="space-y-2.5">
            <Label htmlFor="deal-title">Deal Title</Label>
            <Input
              id="deal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouchedTitle(true)}
              placeholder="e.g. Instagram Reel for Summer Collection"
            />
            {touchedTitle && isTitleEmpty && (
              <p className="text-xs text-destructive">Title is required</p>
            )}
          </div>

          {/* Deliverables */}
          <div className="space-y-2.5">
            <Label>Deliverables</Label>
            <DynamicListInput
              key={`deliverables-${safeIndex}`}
              items={deliverableItems}
              onChange={setDeliverableItems}
              placeholder="Add a deliverable..."
              addLabel="Add deliverable"
            />
          </div>

          {/* Budget */}
          <div className="space-y-2.5">
            <Label htmlFor="deal-budget">Budget (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                id="deal-budget"
                type="number"
                min={0}
                step={0.01}
                value={budgetDollars}
                onChange={(e) => setBudgetDollars(e.target.value)}
                onBlur={() => setTouchedBudget(true)}
                placeholder="0.00"
                className="pl-7"
              />
            </div>

            {touchedBudget && isBudgetEmpty && (
              <p className="text-xs text-destructive">Budget is required</p>
            )}

            {/* Remaining budget — updates live as user types */}
            <div
              className={`flex items-center gap-1.5 text-xs ${
                wouldExceedBudget || isBudgetNegative
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {wouldExceedBudget || isBudgetNegative ? (
                <AlertTriangle className="size-3 shrink-0" />
              ) : (
                <DollarSign className="size-3 shrink-0" />
              )}
              {isBudgetNegative ? (
                <span>Budget must be a positive amount</span>
              ) : wouldExceedBudget ? (
                <span>
                  This amount exceeds the remaining campaign budget of{" "}
                  <span className="font-semibold">
                    ${(effectiveRemaining / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </span>
              ) : budgetCents > 0 ? (
                <span>
                  <span className="font-semibold">
                    ${(remainingAfterThis / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {" "}remaining from Campaign Budget after this deal
                </span>
              ) : (
                <span>
                  <span className="font-semibold">
                    ${(effectiveRemaining / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {" "}remaining from Campaign Budget
                </span>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2.5">
            <Label>Timeline</Label>
            <DatePicker
              value={timeline}
              onChange={(val) => setTimeline(val)}
              placeholder="Select due date..."
            />
          </div>

          {/* Notes */}
          <div className="space-y-2.5">
            <Label htmlFor="deal-notes">Message / Notes</Label>
            <Textarea
              id="deal-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a personal note to the creator..."
              className="min-h-20"
            />
          </div>
        </div>

            {/* Footer */}
            <div className="flex shrink-0 gap-3 border-t p-6">
              <Button
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={handleClose}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 cursor-pointer"
                onClick={handleSend}
                disabled={!canSend || sending}
              >
                {sending && <Loader2 className="size-3.5 animate-spin" />}
                Send Deal
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
