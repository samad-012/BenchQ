import type { Resume } from "@/lib/schemas/resume";

const mock = () => import("@/mocks/resumes").then((m) => m.resumesMock);

export const resumesApi = {
  list: async (): Promise<Resume[]> => (await mock()).list(),

  byCandidate: async (candidateId: string): Promise<Resume[]> => (await mock()).byCandidate(candidateId),

  byId: async (id: string): Promise<Resume> => (await mock()).byId(id),
};
