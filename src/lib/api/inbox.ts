import { http } from "./client";
import { CandidateInboxSchema, InboxMessageSchema, type CandidateInbox, type InboxMessage } from "@/lib/schemas/inbox";

export const inboxApi = {
  byCandidate: (candidateId: string) =>
    http.get<CandidateInbox>(`/api/candidates/${candidateId}/inbox`, { schema: CandidateInboxSchema }),

  connect: (candidateId: string) =>
    http.post<CandidateInbox>(`/api/candidates/${candidateId}/inbox/connect`, { schema: CandidateInboxSchema }),

  disconnect: (candidateId: string) =>
    http.post<CandidateInbox>(`/api/candidates/${candidateId}/inbox/disconnect`, { schema: CandidateInboxSchema }),

  markRead: (messageId: string) =>
    http.post<InboxMessage>(`/api/inbox/messages/${messageId}/read`, { schema: InboxMessageSchema }),
};
