import { http } from "msw";
import { firmFixture, usersFixture } from "@/mocks/fixtures/firm";
import { candidatesFixture } from "@/mocks/fixtures/candidates";
import { respond } from "./_util";
import type { Session } from "@/lib/schemas/session";

export const sessionHandlers = [
  http.get("/api/session", () => {
    const user = usersFixture.find((u) => u.id === "user_adnan")!;
    const session: Session = {
      user,
      firm: firmFixture,
      seatsUsed: usersFixture.filter((u) => u.isActive).length,
      seatLimit: 10,
      activeCandidates: candidatesFixture.filter((c) => c.status !== "INACTIVE").length,
      candidateLimit: 50,
    };
    return respond(session);
  }),
];
