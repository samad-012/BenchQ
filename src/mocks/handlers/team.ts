import { http } from "msw";
import { usersFixture } from "@/mocks/fixtures/firm";
import { respond } from "./_util";

export const teamHandlers = [
  http.get("/api/team", () => respond(usersFixture)),
];
