import { arrayOf, http } from "./client";
import { CandidateDocumentSchema, type CandidateDocument, type UploadDocument } from "@/lib/schemas/document";

export const documentsApi = {
  byCandidate: (candidateId: string) =>
    http.get<CandidateDocument[]>(`/api/candidates/${candidateId}/documents`, { schema: arrayOf(CandidateDocumentSchema) }),

  upload: (candidateId: string, body: UploadDocument) =>
    http.post<CandidateDocument>(`/api/candidates/${candidateId}/documents`, { schema: CandidateDocumentSchema, body }),

  remove: (id: string) =>
    http.delete<CandidateDocument>(`/api/documents/${id}`, { schema: CandidateDocumentSchema }),
};
