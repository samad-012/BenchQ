import { localData } from "@/lib/local-data/store";
import type { Candidate, UpdateCandidate } from "@/lib/schemas/candidate";

/**
 * Candidates adapter — the one place any screen touches the candidate API.
 * Today MSW intercepts these calls; later they hit the real backend and
 * nothing else in the codebase changes.
 */
export const candidatesApi = {
  list: (): Promise<Candidate[]> => localData.candidates.list(),

  byId: (id: string): Promise<Candidate> => localData.candidates.byId(id),

  update: (id: string, body: UpdateCandidate): Promise<Candidate> => localData.candidates.update(id, body),
};
