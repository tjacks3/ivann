"use client";

import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useTranslation } from "@/i18n";
import Link from "next/link";

export default function MessagesPage() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <SectionHeader
        title={t("messages.title")}
        description={t("messages.subtitle")}
      />
      <div className="mt-8">
        <EmptyState
          icon={<MessageSquare className="size-6" />}
          title={t("empty.noMessages")}
          description={t("empty.noMessagesDescription")}
          action={
            <Button render={<Link href="/discover" />}>
              {t("empty.browseCreators")}
            </Button>
          }
        />
      </div>
    </PageContainer>
  );
}
