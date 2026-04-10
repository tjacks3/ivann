"use client";

import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { RequestCard } from "@/components/collaborations/request-card";
import { useCollaborations } from "@/hooks/use-collaborations";
import { useUser } from "@/hooks/use-user";
import { useTranslation } from "@/i18n";
import { Handshake } from "lucide-react";

export default function CollaborationsPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { collaborations, isLoading, refetch } = useCollaborations();

  const isBrand = user?.role === "brand";

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  return (
    <PageContainer>
      <SectionHeader
        title={isBrand ? t("collab.sentTitle") : t("collab.incomingTitle")}
        description={isBrand ? t("collab.sentSubtitle") : t("collab.incomingSubtitle")}
      />

      <div className="mt-8">
        {collaborations.length === 0 ? (
          <EmptyState
            icon={<Handshake className="size-6" />}
            title={isBrand ? t("collab.empty.brandTitle") : t("collab.empty.creatorTitle")}
            description={isBrand ? t("collab.empty.brandDescription") : t("collab.empty.creatorDescription")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {collaborations.map((collab) => (
              <RequestCard
                key={collab.id}
                collab={collab}
                viewAs={isBrand ? "brand" : "creator"}
                onUpdated={refetch}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
