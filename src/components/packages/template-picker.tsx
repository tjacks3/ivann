"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PACKAGE_TEMPLATES, type PackageTemplate } from "@/lib/packages/templates";
import { useTranslation } from "@/i18n";
import { Check, FileEdit } from "lucide-react";

interface TemplatePickerProps {
  onSelect: (template: PackageTemplate | null) => void;
}

export function TemplatePicker({ onSelect }: TemplatePickerProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{t("packages.template.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("packages.template.subtitle")}
          </p>
        </div>

        <div className="space-y-3">
          {PACKAGE_TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary hover:scale-[1.01]"
                onClick={() => onSelect(template)}
              >
                <CardContent className="space-y-3 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {t(`packages.template.${template.id}.name`)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t(`packages.template.${template.id}.useCase`)}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {t(`packages.template.${template.id}.description`)}
                  </p>

                  <ul className="space-y-1">
                    {template.defaults.deliverables.slice(0, 3).map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-1.5 text-xs text-muted-foreground"
                      >
                        <Check className="mt-0.5 size-3 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                    {template.defaults.deliverables.length > 3 && (
                      <li className="text-xs text-muted-foreground/60">
                        +{template.defaults.deliverables.length - 3} more
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Fixed footer — always visible */}
      <div className="shrink-0 border-t bg-background px-4 py-3 text-center">
        <Button onClick={() => onSelect(null)} className="w-full">
          <FileEdit className="size-3.5" />
          {t("packages.template.scratch")}
        </Button>
      </div>
    </>
  );
}
