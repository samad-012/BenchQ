import { localData } from "@/lib/local-data/store";
import type { CandidateDocument, UploadDocument } from "@/lib/schemas/document";

export const documentsApi = {
  byCandidate: (candidateId: string): Promise<CandidateDocument[]> => localData.documents.byCandidate(candidateId),

  upload: (candidateId: string, body: UploadDocument): Promise<CandidateDocument> => localData.documents.upload(candidateId, body),

  remove: (id: string): Promise<CandidateDocument> => localData.documents.remove(id),
};
