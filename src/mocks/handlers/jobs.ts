import { http, HttpResponse } from "msw";
import { jobsFixture } from "@/mocks/fixtures/jobs";
import { respond } from "./_util";

export const jobsHandlers = [
  http.get("/api/jobs", ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    return respond(jobsFixture.slice(offset, offset + limit));
  }),

  http.get("/api/jobs/:id", ({ params }) => {
    const match = jobsFixture.find((j) => j.id === params.id);
    if (!match) {
      return HttpResponse.json(
        { error: "NOT_FOUND", message: "Job not found." },
        { status: 404 },
      );
    }
    return respond(match);
  }),
];
