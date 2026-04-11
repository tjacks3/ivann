"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { getThreadMessages } from "@/app/(app)/messages/actions";
import type { MessageItem } from "@/app/(app)/messages/actions";

export function useMessages(threadId: string) {
  const queryClient = useQueryClient();
  const supabase = useSupabase();

  const { data, isLoading, error } = useQuery({
    queryKey: ["messages", threadId],
    queryFn: () => getThreadMessages(threadId),
    staleTime: 30 * 1000,
  });

  // Realtime subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`thread:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          // Refetch messages and thread list when a new message arrives
          queryClient.invalidateQueries({ queryKey: ["messages", threadId] });
          queryClient.invalidateQueries({ queryKey: ["threads"] });
          queryClient.invalidateQueries({ queryKey: ["unread-count"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, supabase, queryClient]);

  return {
    messages: data?.messages ?? [],
    otherUserName: data?.otherUserName ?? null,
    otherUserAvatar: data?.otherUserAvatar ?? null,
    subject: data?.subject ?? null,
    isLoading,
    error,
  };
}
