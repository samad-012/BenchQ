"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "@/lib/api/documents";
import type { CandidateDocument, UploadDocument } from "@/lib/schemas/document";

const key = (candidateId: string) => ["documents", candidateId] as const;

export function useCandidateDocuments(candidateId: string) {
  return useQuery({ queryKey: key(candidateId), queryFn: () => documentsApi.byCandidate(candidateId), enabled: !!candidateId });
}

export function useUploadDocument(candidateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UploadDocument) => documentsApi.upload(candidateId, body),
    onSuccess: (doc) => queryClient.setQueryData<CandidateDocument[]>(key(candidateId), (list) => [doc, ...(list ?? [])]),
  });
}

export function useRemoveDocument(candidateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.remove(id),
    onMutate: (id) => queryClient.setQueryData<CandidateDocument[]>(key(candidateId), (list) => list?.filter((d) => d.id !== id)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key(candidateId) }),
  });
}
