"use client";

import { useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { LoadingState } from "@/components/shared/loading-state";
import { LinkedAccountCard } from "@/components/social/linked-account-card";
import { ConnectPlatformCard } from "@/components/social/connect-platform-card";
import { ManualLinkForm } from "@/components/social/manual-link-form";
import { buttonVariants } from "@/components/ui/button-variants";
import { useSocialAccounts } from "@/hooks/use-social-accounts";
import { useTranslation } from "@/i18n";
import { PLATFORM_ORDER } from "@/lib/social/platforms";
import { ArrowLeft } from "lucide-react";

export default function SocialsSettingsPage() {
  const { t } = useTranslation();
  const { accounts, isLoading, refetch } = useSocialAccounts();
  const [addingPlatform, setAddingPlatform] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  const linkedPlatforms = new Set(accounts.map((a) => a.platform));
  const unlinkedPlatforms = PLATFORM_ORDER.filter(
    (p) => !linkedPlatforms.has(p),
  );

  const handleLinked = () => {
    setAddingPlatform(null);
    refetch();
  };

  return (
    <PageContainer size="narrow">
      <SectionHeader
        title={t("social.title")}
        description={t("social.subtitle")}
        action={
          <Link href="/settings" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ArrowLeft className="size-3.5" />
            {t("social.backToSettings")}
          </Link>
        }
      />

      {/* Linked Accounts */}
      {accounts.length > 0 && (
        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {t("social.linkedAccounts")}
          </h3>
          {accounts.map((account) => (
            <LinkedAccountCard
              key={account.id}
              account={account}
              onUnlinked={refetch}
            />
          ))}
        </div>
      )}

      {/* Manual Link Form */}
      {addingPlatform && (
        <div className="mt-6">
          <ManualLinkForm
            platform={addingPlatform}
            onClose={() => setAddingPlatform(null)}
            onLinked={handleLinked}
          />
        </div>
      )}

      {/* Available Platforms */}
      {unlinkedPlatforms.length > 0 && (
        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {t("social.addAccount")}
          </h3>
          {unlinkedPlatforms.map((platform) => (
            <ConnectPlatformCard
              key={platform}
              platform={platform}
              onManualAdd={setAddingPlatform}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
