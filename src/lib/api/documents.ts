import type { CandidateDocument, UploadDocument } from "@/lib/schemas/document";

const mock = () => import("@/mocks/documents").then((m) => m.documentsMock);

export const documentsApi = {
  byCandidate: async (candidateId: string): Promise<CandidateDocument[]> => (await mock()).byCandidate(candidateId),

  upload: async (candidateId: string, body: UploadDocument): Promise<CandidateDocument> =>
    (await mock()).upload(candidateId, body),

  remove: async (id: string): Promise<CandidateDocument> => (await mock()).remove(id),
};
