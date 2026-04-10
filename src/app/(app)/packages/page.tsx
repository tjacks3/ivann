"use client";

import { useState } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PackageCard } from "@/components/packages/package-card";
import { PackageForm } from "@/components/packages/package-form";
import { Button } from "@/components/ui/button";
import { usePackages } from "@/hooks/use-packages";
import { useTranslation } from "@/i18n";
import { Package, Plus } from "lucide-react";
import type { Package as PackageType } from "@/db/schema/packages";

export default function PackagesPage() {
  const { t } = useTranslation();
  const { packages, isLoading, refetch } = usePackages();
  const [showForm, setShowForm] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PackageType | null>(null);

  const handleCreate = () => {
    setEditingPkg(null);
    setShowForm(true);
  };

  const handleEdit = (pkg: PackageType) => {
    setEditingPkg(pkg);
    setShowForm(true);
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingPkg(null);
    refetch();
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingPkg(null);
  };

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  return (
    <PageContainer>
      <SectionHeader
        title={t("packages.title")}
        description={t("packages.subtitle")}
        action={
          !showForm && (
            <Button size="sm" onClick={handleCreate}>
              <Plus className="size-3.5" />
              {t("packages.create")}
            </Button>
          )
        }
      />

      {showForm && (
        <div className="mt-6 max-w-xl">
          <PackageForm
            pkg={editingPkg ?? undefined}
            onClose={handleClose}
            onSaved={handleSaved}
          />
        </div>
      )}

      <div className="mt-8">
        {packages.length === 0 && !showForm ? (
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onEdit={handleEdit}
                onDeleted={refetch}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
