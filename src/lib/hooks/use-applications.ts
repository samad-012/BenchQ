"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applicationsApi, followupsApi } from "@/lib/api/applications";
import type { Application } from "@/lib/schemas/application";
import type { ApplicationStatus } from "@/lib/schemas/enums";

export function useApplications(candidateId?: string) {
  return useQuery({
    queryKey: ["applications", { candidateId }],
    queryFn: () => applicationsApi.list(candidateId ? { candidateId } : undefined),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ["application", id],
    queryFn: () => applicationsApi.byId(id),
    enabled: !!id,
  });
}

export function useFollowups(userId?: string) {
  return useQuery({
    queryKey: ["followups", { userId }],
    queryFn: () => followupsApi.list(userId ? { userId } : undefined),
  });
}

/**
 * Move an application to a new stage. Optimistic: every cached application
 * list updates at once (board, list, inbox suggestions), then refetches.
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: ApplicationStatus; note: string | null }) =>
      applicationsApi.updateStatus(id, { status, note }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["applications"] });
      const previous = queryClient.getQueriesData<Application[]>({ queryKey: ["applications"] });
      queryClient.setQueriesData<Application[]>({ queryKey: ["applications"] }, (list) =>
        list?.map((a) => (a.id === id ? { ...a, status } : a)),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => context?.previous.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data)),
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["applications"] });
      void queryClient.invalidateQueries({ queryKey: ["application", id] });
    },
  });
}
