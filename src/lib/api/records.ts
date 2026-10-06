import type { Record_ } from "@/lib/schemas/record";

const mock = () => import("@/mocks/records").then((m) => m.recordsMock);

export const recordsApi = {
  byCandidate: async (candidateId: string): Promise<Record_> => (await mock()).byCandidate(candidateId),
};
