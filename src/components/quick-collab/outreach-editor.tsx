"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/i18n";
import { Pencil, Check, Send, Loader2 } from "lucide-react";
import type { OutreachDraft } from "@/app/(app)/brand/quick-deal/actions";

interface OutreachEditorProps {
  outreaches: OutreachDraft[];
  onUpdateMessage: (outreachId: string, message: string) => Promise<void>;
  onSend: (outreachIds: string[]) => Promise<void>;
  isSending: boolean;
}

export function OutreachEditor({
  outreaches,
  onUpdateMessage,
  onSend,
  isSending,
}: OutreachEditorProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(outreaches.map((o) => o.id)),
  );

  const handleEdit = (outreach: OutreachDraft) => {
    setEditingId(outreach.id);
    setEditMessage(outreach.message);
  };

  const handleSaveEdit = async (outreachId: string) => {
    await onUpdateMessage(outreachId, editMessage);
    setEditingId(null);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSendSelected = () => {
    onSend([...selectedIds]);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{t("quickCollab.outreach.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("quickCollab.outreach.subtitle")}
        </p>
      </div>

      <div className="space-y-4">
        {outreaches.map((outreach) => {
          const initials = (outreach.creatorName || "?")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          const isEditing = editingId === outreach.id;
          const isSelected = selectedIds.has(outreach.id);

          return (
            <Card
              key={outreach.id}
              className={isSelected ? "ring-1 ring-primary/30" : "opacity-60"}
            >
              <CardContent className="space-y-3 pt-4">
                {/* Creator header + checkbox */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(outreach.id)}
                        className="size-4 rounded border-input accent-primary"
                      />
                    </label>
                    <Avatar className="size-8">
                      {outreach.creatorAvatar && (
                        <AvatarImage
                          src={outreach.creatorAvatar}
                          alt={outreach.creatorName || ""}
                        />
                      )}
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {outreach.creatorName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{outreach.creatorUsername}
                      </p>
                    </div>
                  </div>

                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(outreach)}
                      className="cursor-pointer"
                    >
                      <Pencil className="size-3.5" />
                      {t("quickCollab.campaign.edit")}
                    </Button>
                  )}
                </div>

                {/* Message */}
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      className="min-h-32"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(null)}
                        className="cursor-pointer"
                      >
                        {t("quickCollab.outreach.cancel")}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(outreach.id)}
                        className="cursor-pointer"
                      >
                        <Check className="size-3.5" />
                        {t("quickCollab.outreach.saveEdit")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm leading-relaxed font-sans">
                    {outreach.message}
                  </pre>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Send button */}
      <div className="flex justify-center pt-2">
        <Button
          onClick={handleSendSelected}
          disabled={selectedIds.size === 0 || isSending}
          className="cursor-pointer"
        >
          {isSending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Send className="size-3.5" />
          )}
          {t(selectedIds.size === 1 ? "quickCollab.outreach.sendOne" : "quickCollab.outreach.sendOther", { count: selectedIds.size })}
        </Button>
      </div>
    </div>
  );
}
