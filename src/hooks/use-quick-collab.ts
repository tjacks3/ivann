"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createQuickCollabRequest,
  matchCreators,
  updateMatchStatus,
  generateCampaign,
  updateCampaign,
  generateOutreachMessages,
  updateOutreachMessage,
  sendOutreaches,
  getQuickCollabRequest,
} from "@/app/(app)/brand/quick-collab/actions";
import type { QuickCollabIntakeValues, CampaignEditValues } from "@/lib/validations/quick-collab";

export function useQuickCollab(requestId?: string) {
  const queryClient = useQueryClient();

  const { data: existingRequest, isLoading } = useQuery({
    queryKey: ["quick-collab", requestId],
    queryFn: () => getQuickCollabRequest(requestId!),
    enabled: !!requestId,
    staleTime: 60 * 1000,
  });

  const invalidate = useCallback(() => {
    if (requestId) {
      queryClient.invalidateQueries({ queryKey: ["quick-collab", requestId] });
    }
  }, [queryClient, requestId]);

  const createRequest = useCallback(
    async (data: QuickCollabIntakeValues) => {
      return createQuickCollabRequest(data);
    },
    [],
  );

  const doMatchCreators = useCallback(
    async (reqId: string) => {
      const result = await matchCreators(reqId);
      invalidate();
      return result;
    },
    [invalidate],
  );

  const doUpdateMatchStatus = useCallback(
    async (matchId: string, status: "selected" | "skipped") => {
      const result = await updateMatchStatus(matchId, status);
      invalidate();
      return result;
    },
    [invalidate],
  );

  const doGenerateCampaign = useCallback(
    async (reqId: string) => {
      const result = await generateCampaign(reqId);
      invalidate();
      return result;
    },
    [invalidate],
  );

  const doUpdateCampaign = useCallback(
    async (campaignId: string, data: CampaignEditValues) => {
      const result = await updateCampaign(campaignId, data);
      invalidate();
      return result;
    },
    [invalidate],
  );

  const doGenerateMessages = useCallback(
    async (campaignId: string) => {
      const result = await generateOutreachMessages(campaignId);
      invalidate();
      return result;
    },
    [invalidate],
  );

  const doUpdateMessage = useCallback(
    async (outreachId: string, message: string) => {
      const result = await updateOutreachMessage(outreachId, message);
      invalidate();
      return result;
    },
    [invalidate],
  );

  const doSendOutreaches = useCallback(
    async (outreachIds: string[]) => {
      const result = await sendOutreaches(outreachIds);
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["quick-collab-tracking"] });
      return result;
    },
    [invalidate, queryClient],
  );

  return {
    existingRequest: existingRequest?.success ? existingRequest : null,
    isLoading,
    createRequest,
    matchCreators: doMatchCreators,
    updateMatchStatus: doUpdateMatchStatus,
    generateCampaign: doGenerateCampaign,
    updateCampaign: doUpdateCampaign,
    generateMessages: doGenerateMessages,
    updateMessage: doUpdateMessage,
    sendOutreaches: doSendOutreaches,
  };
}
