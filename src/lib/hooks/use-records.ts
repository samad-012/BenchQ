"use client";

import { useQuery } from "@tanstack/react-query";
import { recordsApi } from "@/lib/api/records";

export function useRecord(candidateId: string) {
  return useQuery({
    queryKey: ["record", candidateId],
    queryFn: () => recordsApi.byCandidate(candidateId),
    enabled: !!candidateId,
  });
}
