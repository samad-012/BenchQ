import { http, HttpResponse } from "msw";
import { candidatesFixture } from "@/mocks/fixtures/candidates";
import { UpdateCandidateSchema } from "@/lib/schemas/candidate";
import { respond } from "./_util";

export const candidatesHandlers = [
  http.get("/api/candidates", () => respond(candidatesFixture)),

  http.get("/api/candidates/:id", ({ params }) => {
    const match = candidatesFixture.find((c) => c.id === params.id);
    if (!match) {
      return HttpResponse.json(
        { error: "NOT_FOUND", message: "Candidate not found." },
        { status: 404 },
      );
    }
    return respond(match);
  }),

  http.patch("/api/candidates/:id", async ({ params, request }) => {
    const match = candidatesFixture.find((c) => c.id === params.id);
    const parsed = UpdateCandidateSchema.safeParse(await request.json());
    if (!match || !parsed.success) {
      return HttpResponse.json({ error: "INVALID_UPDATE", message: "Those details couldn't be saved." }, { status: 400 });
    }
    Object.assign(match, parsed.data, { updatedAt: new Date().toISOString() });
    return respond(match);
  }),
];
