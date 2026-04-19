"use client";

import { use } from "react";
import Link from "next/link";
import { ChatView } from "@/components/messages/chat-view";
import { buttonVariants } from "@/components/ui/button-variants";
import { useTranslation } from "@/i18n";
import { ArrowLeft } from "lucide-react";

export default function ChatPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = use(params);
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 top-16 z-40 flex flex-col bg-background">
      {/* Back to inbox */}
      <div className="shrink-0 border-b px-4 py-3">
        <Link
          href="/messages"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-3.5" />
          {t("messages.back")}
        </Link>
      </div>

      <ChatView threadId={threadId} />
    </div>
  );
}
