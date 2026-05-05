"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PackageTypeBadge } from "@/components/packages/package-type-badge";
import { DeliverablesList } from "@/components/packages/deliverables-list";
import { formatPrice } from "@/lib/currency";
import { useTranslation } from "@/i18n";
import { createDeal } from "@/app/(app)/deals/actions";
import { getCurrencyForLocale } from "@/lib/currency";
import {
  Loader2,
  Clock,
  Package as PackageIcon,
  RefreshCw,
} from "lucide-react";
import type { Package } from "@/db/schema/packages";

interface PackageOfferSummaryProps {
  pkg: Package;
  creatorId: string;
  creatorName: string;
  onClose: () => void;
}

export function PackageOfferSummary({
  pkg,
  creatorId,
  creatorName,
  onClose,
}: PackageOfferSummaryProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const currency = pkg.currency || getCurrencyForLocale(locale);

  const deliverablesText = pkg.deliverables ?? "";

  const onSubmit = async () => {
    setSaving(true);
    setServerError(null);

    const result = await createDeal({
      creatorId,
      title: `Deal: ${pkg.title}`,
      deliverables: deliverablesText || undefined,
      budget: pkg.priceInCents,
      currency,
      timeline: pkg.deliveryDays ? `${pkg.deliveryDays} days` : undefined,
      notes: notes.trim() || undefined,
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
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        {/* Selected Package tag */}
        <div className="mb-5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <PackageIcon className="size-3" />
            {t("offer.selectedPackage")}
          </span>
          <PackageTypeBadge type={pkg.type} className="text-xs px-2 py-0.5" />
        </div>

        {/* Receipt card */}
        <div className="rounded-xl border bg-card">
          {/* Package title */}
          <div className="border-b px-5 py-4">
            <h3 className="text-lg font-semibold">{pkg.title}</h3>
            {pkg.description && (
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {pkg.description}
              </p>
            )}
          </div>

          {/* Price + Delivery — high emphasis row */}
          <div className="grid grid-cols-2 divide-x border-b">
            <div className="px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("offer.price")}
              </p>
              <p className="mt-1 text-2xl font-bold text-primary">
                {formatPrice(pkg.priceInCents, currency, locale)}
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("offer.delivery")}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <Clock className="size-4 text-primary" />
                <span className="text-2xl font-bold">
                  {pkg.deliveryDays ?? "—"}
                </span>
                {pkg.deliveryDays && (
                  <span className="text-sm text-muted-foreground">
                    {t("offer.days")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Deliverables */}
          {deliverablesText && (
            <div className="border-b px-5 py-4">
              <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("offer.deliverables")}
              </p>
              <DeliverablesList value={deliverablesText} />
            </div>
          )}

          {/* Revisions */}
          {pkg.revisions > 0 && (
            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("offer.revisions")}
                </p>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <RefreshCw className="size-3.5 text-muted-foreground" />
                  {pkg.revisions} {pkg.revisions === 1 ? t("offer.revision") : t("offer.revisionsLabel")}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes input — only editable field */}
        <div className="mt-6 space-y-2">
          <label
            htmlFor="offer-notes"
            className="text-sm font-medium"
          >
            {t("offer.additionalNotes")}
          </label>
          <Textarea
            id="offer-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("offer.notesPlaceholder")}
            className="min-h-24 resize-none"
          />
        </div>

        {serverError && (
          <p className="mt-3 text-xs text-destructive">{serverError}</p>
        )}
      </div>

      {/* Fixed footer */}
      <div className="shrink-0 border-t bg-background p-6">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {t("collab.form.cancel")}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={saving}
            className="flex-1"
          >
            {saving && <Loader2 className="size-3 animate-spin" />}
            {t("collab.form.send")}
          </Button>
        </div>
      </div>
    </div>
  );
}
