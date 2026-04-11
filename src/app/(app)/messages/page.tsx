"use client";

import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { ThreadList } from "@/components/messages/thread-list";
import { buttonVariants } from "@/components/ui/button-variants";
import { useThreads } from "@/hooks/use-threads";
import { useTranslation } from "@/i18n";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  const { t } = useTranslation();
  const { threads, isLoading } = useThreads();

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  return (
    <PageContainer size="narrow">
      <SectionHeader
        title={t("messages.title")}
        description={t("messages.subtitle")}
      />

      <div className="mt-6">
        {threads.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="size-6" />}
            title={t("messages.empty.title")}
            description={t("messages.empty.description")}
            action={
              <Link href="/discover" className={buttonVariants()}>
                {t("messages.empty.browse")}
              </Link>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <ThreadList threads={threads} />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
