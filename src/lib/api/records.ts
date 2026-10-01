import { localData } from "@/lib/local-data/store";
import type { Record_ } from "@/lib/schemas/record";

export const recordsApi = {
  byCandidate: (candidateId: string): Promise<Record_> => localData.records.byCandidate(candidateId),
};
