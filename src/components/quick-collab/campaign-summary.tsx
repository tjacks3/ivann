"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n";
import { Pencil, Check } from "lucide-react";
import type { QuickCollabCampaign } from "@/db/schema/quick-collab";

interface CampaignSummaryProps {
  campaign: QuickCollabCampaign;
  onSave: (data: {
    goal: string;
    deliverable: string;
    budgetPerCreator: string;
    timeline: string;
    summary: string;
  }) => Promise<void>;
}

export function CampaignSummary({ campaign, onSave }: CampaignSummaryProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    goal: campaign.goal,
    deliverable: campaign.deliverable,
    budgetPerCreator: campaign.budgetPerCreator,
    timeline: campaign.timeline,
    summary: campaign.summary,
  });

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{t("quickCollab.campaign.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("quickCollab.campaign.subtitle")}
        </p>
      </div>

      <Card className="min-h-[320px]">
        <CardContent className="relative space-y-4 pt-5 pb-6">
          {!editing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
              className="absolute right-5 top-5 cursor-pointer"
            >
              <Pencil className="size-3.5" />
              {t("quickCollab.campaign.edit")}
            </Button>
          )}
          {editing ? (
            <>
              <div className="space-y-2">
                <Label>{t("quickCollab.campaign.goal")}</Label>
                <Textarea
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  className="min-h-16"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("quickCollab.campaign.deliverable")}</Label>
                <Input
                  value={form.deliverable}
                  onChange={(e) =>
                    setForm({ ...form, deliverable: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("quickCollab.campaign.budgetPerCreator")}</Label>
                  <Input
                    value={form.budgetPerCreator}
                    onChange={(e) =>
                      setForm({ ...form, budgetPerCreator: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("quickCollab.campaign.timeline")}</Label>
                  <Input
                    value={form.timeline}
                    onChange={(e) =>
                      setForm({ ...form, timeline: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setForm({
                      goal: campaign.goal,
                      deliverable: campaign.deliverable,
                      budgetPerCreator: campaign.budgetPerCreator,
                      timeline: campaign.timeline,
                      summary: campaign.summary,
                    });
                    setEditing(false);
                  }}
                  className="cursor-pointer"
                >
                  {t("quickCollab.campaign.cancel")}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="cursor-pointer"
                >
                  <Check className="size-3.5" />
                  {t("quickCollab.campaign.save")}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-5">
              <div className="py-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("quickCollab.campaign.goal")}
                </p>
                <p className="mt-1 text-sm text-foreground">{campaign.goal}</p>
              </div>
              <div className="py-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("quickCollab.campaign.deliverable")}
                </p>
                <p className="mt-1 text-sm text-foreground">{campaign.deliverable}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="py-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("quickCollab.campaign.budgetPerCreator")}
                  </p>
                  <p className="mt-1 text-sm text-foreground">{campaign.budgetPerCreator}</p>
                </div>
                <div className="py-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("quickCollab.campaign.timeline")}
                  </p>
                  <p className="mt-1 text-sm text-foreground">{campaign.timeline}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
