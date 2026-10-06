import type { CandidateInbox, InboxMessage } from "@/lib/schemas/inbox";

const mock = () => import("@/mocks/inbox").then((m) => m.inboxMock);

export const inboxApi = {
  byCandidate: async (candidateId: string): Promise<CandidateInbox> => (await mock()).byCandidate(candidateId),

  connect: async (candidateId: string): Promise<CandidateInbox> => (await mock()).connect(candidateId),

  disconnect: async (candidateId: string): Promise<CandidateInbox> => (await mock()).disconnect(candidateId),

  markRead: async (messageId: string): Promise<InboxMessage> => (await mock()).markRead(messageId),
};
