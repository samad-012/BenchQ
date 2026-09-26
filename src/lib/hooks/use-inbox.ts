"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inboxApi } from "@/lib/api/inbox";
import type { CandidateInbox } from "@/lib/schemas/inbox";

const key = (candidateId: string) => ["inbox", candidateId] as const;

export function useCandidateInbox(candidateId: string) {
  return useQuery({ queryKey: key(candidateId), queryFn: () => inboxApi.byCandidate(candidateId), enabled: !!candidateId });
}

/** Simulated Google account hand-off + first sync. The result replaces the cached inbox. */
export function useConnectMailbox(candidateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => inboxApi.connect(candidateId),
    onSuccess: (inbox) => queryClient.setQueryData(key(candidateId), inbox),
  });
}

export function useDisconnectMailbox(candidateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => inboxApi.disconnect(candidateId),
    onSuccess: (inbox) => queryClient.setQueryData(key(candidateId), inbox),
  });
}

export function useMarkRead(candidateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => inboxApi.markRead(messageId),
    onMutate: (messageId) => {
      queryClient.setQueryData<CandidateInbox>(key(candidateId), (inbox) =>
        inbox ? { ...inbox, messages: inbox.messages.map((m) => (m.id === messageId ? { ...m, isRead: true } : m)) } : inbox,
      );
    },
  });
}
