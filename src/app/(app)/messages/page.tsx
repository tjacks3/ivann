"use client";

import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button-variants";
import { MessageSquare } from "lucide-react";
import { useTranslation } from "@/i18n";

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
            <Link href="/discover" className={buttonVariants()}>
              {t("empty.browseCreators")}
            </Link>
          }
        />
      </div>
    </PageContainer>
  );
}
