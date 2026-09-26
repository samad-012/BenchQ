import { http } from "./client";
import { RecordSchema, type Record_ } from "@/lib/schemas/record";

export const recordsApi = {
  byCandidate: (candidateId: string) =>
    http.get<Record_>(`/api/candidates/${candidateId}/record`, { schema: RecordSchema }),
};
