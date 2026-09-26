import { http, HttpResponse } from "msw";
import { applicationsFixture, followupsFixture } from "@/mocks/fixtures/applications";
import { UpdateApplicationStatusSchema } from "@/lib/schemas/inbox";
import { respond } from "./_util";

export const applicationsHandlers = [
  http.get("/api/applications", ({ request }) => {
    const url = new URL(request.url);
    const candidateId = url.searchParams.get("candidateId");
    const filtered = candidateId
      ? applicationsFixture.filter((a) => a.candidateId === candidateId)
      : applicationsFixture;
    return respond(filtered);
  }),

  http.get("/api/applications/:id", ({ params }) => {
    const match = applicationsFixture.find((a) => a.id === params.id);
    if (!match) {
      return HttpResponse.json(
        { error: "NOT_FOUND", message: "Application not found." },
        { status: 404 },
      );
    }
    return respond(match);
  }),

  /** Move an application to a new stage and append the event — the same write the kanban makes. */
  http.patch("/api/applications/:id/status", async ({ params, request }) => {
    const match = applicationsFixture.find((a) => a.id === params.id);
    const parsed = UpdateApplicationStatusSchema.safeParse(await request.json());
    if (!match || !parsed.success) {
      return HttpResponse.json({ error: "INVALID_UPDATE", message: "That status change couldn't be saved." }, { status: 400 });
    }
    const now = new Date().toISOString();
    const { status, note } = parsed.data;
    match.events.push({ id: `evt_${match.id}_${match.events.length}`, applicationId: match.id, fromStatus: match.status, toStatus: status, note, actorUserId: "user_adnan", isAutomated: false, createdAt: now });
    match.status = status;
    if (status === "RESPONSE" && !match.firstResponseAt) match.firstResponseAt = now;
    if (status === "INTERVIEW" && !match.interviewAt) match.interviewAt = now;
    if (status === "OFFER") match.offerAt = now;
    if (["PLACED", "REJECTED", "WITHDRAWN", "EXPIRED"].includes(status)) match.closedAt = now;
    return respond(match);
  }),
];

export const followupsHandlers = [
  http.get("/api/followups", ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const filtered = userId
      ? followupsFixture.filter((f) => f.assignedToUserId === userId)
      : followupsFixture;
    return respond(filtered);
  }),
];
