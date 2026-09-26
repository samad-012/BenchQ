"use client";

import { useQuery } from "@tanstack/react-query";
import { resumesApi } from "@/lib/api/resumes";

export function useAllResumes() {
  return useQuery({ queryKey: ["resumes"], queryFn: () => resumesApi.list() });
}

export function useResumes(candidateId: string) {
  return useQuery({
    queryKey: ["resumes", candidateId],
    queryFn: () => resumesApi.byCandidate(candidateId),
    enabled: !!candidateId,
  });
}

export function useResume(id: string) {
  return useQuery({
    queryKey: ["resume", id],
    queryFn: () => resumesApi.byId(id),
    enabled: !!id,
  });
}
