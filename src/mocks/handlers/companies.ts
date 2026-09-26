import { http, HttpResponse } from "msw";
import { companiesFixture } from "@/mocks/fixtures/companies";
import { respond } from "./_util";

export const companiesHandlers = [
  http.get("/api/companies", () => respond(companiesFixture)),

  http.get("/api/companies/:id", ({ params }) => {
    const match = companiesFixture.find((c) => c.id === params.id);
    if (!match) {
      return HttpResponse.json(
        { error: "NOT_FOUND", message: "Company not found." },
        { status: 404 },
      );
    }
    return respond(match);
  }),
];
