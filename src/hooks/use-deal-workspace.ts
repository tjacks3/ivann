"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import {
  getCollaboration,
  getCollaborationMessages,
} from "@/app/(app)/deal-workspace/actions";

interface UseCollaborationWorkspaceOptions {
  /** When true, messages poll more aggressively (every 3s). */
  isMessagesActive?: boolean;
}

export function useCollaborationWorkspace(
  collaborationId: string,
  options?: UseCollaborationWorkspaceOptions,
) {
  const queryClient = useQueryClient();
  const supabase = useSupabase();
  const isMessagesActive = options?.isMessagesActive ?? false;

  const {
    data: collaboration,
    isLoading: isLoadingCollab,
    error: collabError,
  } = useQuery({
    queryKey: ["collaboration-workspace", collaborationId],
    queryFn: () => getCollaboration(collaborationId),
    staleTime: 30 * 1000,
  });

  const {
    data: messages,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useQuery({
    queryKey: ["collaboration-messages", collaborationId],
    queryFn: () => getCollaborationMessages(collaborationId),
    staleTime: isMessagesActive ? 0 : 30 * 1000,
    refetchInterval: isMessagesActive ? 10_000 : false,
  });

  // Realtime subscription for new collaboration messages
  useEffect(() => {
    const channel = supabase
      .channel(`collab:${collaborationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "collaboration_messages",
          filter: `collaboration_id=eq.${collaborationId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["collaboration-messages", collaborationId],
          });
          queryClient.invalidateQueries({
            queryKey: ["collaboration-workspace", collaborationId],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [collaborationId, supabase, queryClient]);

  const refetch = () => {
    queryClient.invalidateQueries({
      queryKey: ["collaboration-workspace", collaborationId],
    });
    queryClient.invalidateQueries({
      queryKey: ["collaboration-messages", collaborationId],
    });
  };

  return {
    collaboration: collaboration ?? null,
    messages: messages ?? [],
    isLoading: isLoadingCollab || isLoadingMessages,
    error: collabError || messagesError,
    refetch,
  };
}
