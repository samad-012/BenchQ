import { http, HttpResponse } from "msw";
import { recordsFixture } from "@/mocks/fixtures/records";
import { respond } from "./_util";

export const recordsHandlers = [
  http.get("/api/candidates/:candidateId/record", ({ params }) => {
    const match = recordsFixture.find((r) => r.candidateId === params.candidateId);
    if (!match) {
      return HttpResponse.json(
        { error: "NOT_FOUND", message: "Record not found." },
        { status: 404 },
      );
    }
    return respond(match);
  }),
];
