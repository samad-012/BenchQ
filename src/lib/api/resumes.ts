import { localData } from "@/lib/local-data/store";
import type { Resume } from "@/lib/schemas/resume";

export const resumesApi = {
  list: (): Promise<Resume[]> => localData.resumes.list(),

  byCandidate: (candidateId: string): Promise<Resume[]> => localData.resumes.byCandidate(candidateId),

  byId: (id: string): Promise<Resume> => localData.resumes.byId(id),
};
