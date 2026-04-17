"use client";

import { useState } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PackageCard } from "@/components/packages/package-card";
import { PackageForm } from "@/components/packages/package-form";
import { TemplatePicker } from "@/components/packages/template-picker";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { usePackages } from "@/hooks/use-packages";
import { useTranslation } from "@/i18n";
import { Package, Plus, X, ArrowLeft } from "lucide-react";
import type { Package as PackageType } from "@/db/schema/packages";
import type { PackageTemplate } from "@/lib/packages/templates";

type SheetStep = "template" | "form";

export default function PackagesPage() {
  const { t } = useTranslation();
  const { packages, isLoading, refetch } = usePackages();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetStep, setSheetStep] = useState<SheetStep>("template");
  const [editingPkg, setEditingPkg] = useState<PackageType | undefined>();
  const [selectedTemplate, setSelectedTemplate] = useState<PackageTemplate | null>(null);

  const handleCreate = () => {
    setEditingPkg(undefined);
    setSelectedTemplate(null);
    setSheetStep("template");
    setSheetOpen(true);
  };

  const handleEdit = (pkg: PackageType) => {
    setEditingPkg(pkg);
    setSelectedTemplate(null);
    setSheetStep("form");
    setSheetOpen(true);
  };

  const handleTemplateSelect = (template: PackageTemplate | null) => {
    setSelectedTemplate(template);
    setSheetStep("form");
  };

  const handleSaved = () => {
    setSheetOpen(false);
    setEditingPkg(undefined);
    setSelectedTemplate(null);
    refetch();
  };

  const handleClose = () => {
    setSheetOpen(false);
    setEditingPkg(undefined);
    setSelectedTemplate(null);
  };

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  const isEditing = !!editingPkg;
  const drafts = packages.filter((p) => p.status === "draft");
  const published = packages.filter((p) => p.status === "active");
  const archived = packages.filter((p) => p.status === "archived");

  return (
    <PageContainer>
      <SectionHeader
        title={t("packages.title")}
        description={t("packages.subtitle")}
        action={
          <Button size="sm" onClick={handleCreate}>
            <Plus className="size-3.5" />
            {t("packages.create")}
          </Button>
        }
      />

      {/* Sheet modal for template pick + create/edit */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col overflow-hidden p-0 sm:max-w-md"
          showCloseButton={false}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              {sheetStep === "form" && !isEditing && (
                <button
                  type="button"
                  onClick={() => setSheetStep("template")}
                  className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                </button>
              )}
              <SheetTitle className="text-base font-bold">
                {sheetStep === "template"
                  ? t("packages.template.title")
                  : isEditing
                    ? t("packages.edit")
                    : t("packages.create")}
              </SheetTitle>
            </div>
            <SheetClose>
              <X className="size-5" />
            </SheetClose>
          </div>

          {sheetStep === "template" && (
            <TemplatePicker onSelect={handleTemplateSelect} />
          )}

          {sheetStep === "form" && (
            <PackageForm
              pkg={editingPkg}
              templateDefaults={selectedTemplate?.defaults}
              templateId={selectedTemplate?.id}
              onClose={handleClose}
              onSaved={handleSaved}
            />
          )}
        </SheetContent>
      </Sheet>

      <div className="mt-8">
        {packages.length === 0 ? (
          <EmptyState
            icon={<Package className="size-6" />}
            title={t("packages.empty.title")}
            description={t("packages.empty.description")}
            action={
              <Button onClick={handleCreate}>
                <Plus className="size-3.5" />
                {t("packages.create")}
              </Button>
            }
          />
        ) : (
          <div className="space-y-8">
            {/* Draft packages */}
            {drafts.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    {t("packages.section.drafts")}
                  </h3>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {drafts.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {drafts.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      onEdit={handleEdit}
                      onDeleted={refetch}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Published packages */}
            {published.length > 0 && (
              <div>
                {drafts.length > 0 && (
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                    {t("packages.section.published")}
                  </h3>
                )}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {published.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      onEdit={handleEdit}
                      onDeleted={refetch}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Archived packages */}
            {archived.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                  {t("packages.section.archived")}
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {archived.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      onEdit={handleEdit}
                      onDeleted={refetch}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
