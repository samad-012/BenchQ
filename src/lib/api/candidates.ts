import { arrayOf, http } from "./client";
import { CandidateSchema, type Candidate, type UpdateCandidate } from "@/lib/schemas/candidate";

/**
 * Candidates adapter — the one place any screen touches the candidate API.
 * Today MSW intercepts these calls; later they hit the real backend and
 * nothing else in the codebase changes.
 */
export const candidatesApi = {
  list: () =>
    http.get<Candidate[]>("/api/candidates", { schema: arrayOf(CandidateSchema) }),

  byId: (id: string) =>
    http.get<Candidate>(`/api/candidates/${id}`, { schema: CandidateSchema }),

  update: (id: string, body: UpdateCandidate) =>
    http.patch<Candidate>(`/api/candidates/${id}`, { schema: CandidateSchema, body }),
};
