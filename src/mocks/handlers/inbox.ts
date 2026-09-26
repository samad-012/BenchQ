import { delay, http, HttpResponse } from "msw";
import { candidatesFixture } from "@/mocks/fixtures/candidates";
import { MAILBOX_CONNECTED_SINCE, inboxMessagesFixture, initiallyConnected } from "@/mocks/fixtures/inbox";
import type { CandidateInbox } from "@/lib/schemas/inbox";
import { respond } from "./_util";

/** Session-only mock state: which mailboxes are connected, and when each connected. */
const connectedAt = new Map<string, string>([...initiallyConnected].map((id) => [id, MAILBOX_CONNECTED_SINCE]));

function inboxFor(candidateId: string): CandidateInbox {
  const since = connectedAt.get(candidateId);
  const candidate = candidatesFixture.find((c) => c.id === candidateId);
  if (!since || !candidate) return { connection: null, messages: [] };
  return {
    connection: {
      candidateId,
      provider: "GOOGLE",
      address: candidate.email ?? `${candidate.fullName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      connectedAt: since,
      lastSyncedAt: new Date(Date.now() - 2 * 60_000).toISOString(),
    },
    messages: inboxMessagesFixture.filter((m) => m.candidateId === candidateId),
  };
}

export const inboxHandlers = [
  http.get("/api/candidates/:candidateId/inbox", ({ params }) => respond(inboxFor(String(params.candidateId)))),

  // Simulates the Google consent hand-off plus the first sync.
  http.post("/api/candidates/:candidateId/inbox/connect", async ({ params }) => {
    const candidateId = String(params.candidateId);
    if (!candidatesFixture.some((c) => c.id === candidateId)) {
      return HttpResponse.json({ error: "NOT_FOUND", message: "Candidate not found." }, { status: 404 });
    }
    await delay(1200);
    connectedAt.set(candidateId, new Date().toISOString());
    return respond(inboxFor(candidateId));
  }),

  http.post("/api/candidates/:candidateId/inbox/disconnect", ({ params }) => {
    connectedAt.delete(String(params.candidateId));
    return respond(inboxFor(String(params.candidateId)));
  }),

  http.post("/api/inbox/messages/:id/read", ({ params }) => {
    const message = inboxMessagesFixture.find((m) => m.id === params.id);
    if (!message) return HttpResponse.json({ error: "NOT_FOUND", message: "Email not found." }, { status: 404 });
    message.isRead = true;
    return respond(message, { latency: 80 });
  }),
];
