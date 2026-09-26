import { arrayOf, http } from "./client";
import { ResumeSchema, type Resume } from "@/lib/schemas/resume";

export const resumesApi = {
  list: () => http.get<Resume[]>("/api/resumes", { schema: arrayOf(ResumeSchema) }),

  byCandidate: (candidateId: string) =>
    http.get<Resume[]>(`/api/candidates/${candidateId}/resumes`, { schema: arrayOf(ResumeSchema) }),

  byId: (id: string) =>
    http.get<Resume>(`/api/resumes/${id}`, { schema: ResumeSchema }),
};
