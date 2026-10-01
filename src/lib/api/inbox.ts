import { localData } from "@/lib/local-data/store";
import type { CandidateInbox, InboxMessage } from "@/lib/schemas/inbox";

export const inboxApi = {
  byCandidate: (candidateId: string): Promise<CandidateInbox> => localData.inbox.byCandidate(candidateId),

  connect: (candidateId: string): Promise<CandidateInbox> => localData.inbox.connect(candidateId),

  disconnect: (candidateId: string): Promise<CandidateInbox> => localData.inbox.disconnect(candidateId),

  markRead: (messageId: string): Promise<InboxMessage> => localData.inbox.markRead(messageId),
};
