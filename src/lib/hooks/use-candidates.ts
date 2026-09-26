"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateCandidate } from "@/lib/schemas/candidate";
import { candidatesApi } from "@/lib/api/candidates";

export function useCandidates() {
  return useQuery({
    queryKey: ["candidates"],
    queryFn: () => candidatesApi.list(),
  });
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: ["candidate", id],
    queryFn: () => candidatesApi.byId(id),
    enabled: !!id,
  });
}

export function useUpdateCandidate(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdateCandidate) => candidatesApi.update(id, patch),
    onSuccess: (candidate) => {
      queryClient.setQueryData(["candidate", id], candidate);
      void queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
}
