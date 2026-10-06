import type { Candidate, UpdateCandidate } from "@/lib/schemas/candidate";

const mock = () => import("@/mocks/candidates").then((m) => m.candidatesMock);

export const candidatesApi = {
  list: async (): Promise<Candidate[]> => (await mock()).list(),

  byId: async (id: string): Promise<Candidate> => (await mock()).byId(id),

  update: async (id: string, body: UpdateCandidate): Promise<Candidate> => (await mock()).update(id, body),
};
