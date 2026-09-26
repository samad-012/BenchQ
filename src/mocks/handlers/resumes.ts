import { http, HttpResponse } from "msw";
import { resumesFixture } from "@/mocks/fixtures/resumes";
import { respond } from "./_util";

export const resumesHandlers = [
  http.get("/api/resumes", () => respond(resumesFixture)),

  http.get("/api/candidates/:candidateId/resumes", ({ params }) => {
    const filtered = resumesFixture.filter((r) => r.candidateId === params.candidateId);
    return respond(filtered);
  }),

  http.get("/api/resumes/:id", ({ params }) => {
    const match = resumesFixture.find((r) => r.id === params.id);
    if (!match) {
      return HttpResponse.json(
        { error: "NOT_FOUND", message: "Resume not found." },
        { status: 404 },
      );
    }
    return respond(match);
  }),
];
