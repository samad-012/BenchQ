import { SessionSchema, type Session } from "@/lib/schemas/session";
import { candidates } from "./candidates";
import { currentUser, firm, users } from "./team";
import { mockResult } from "./_shared";

export const sessionMock = {
  current: (): Promise<Session> =>
    mockResult(
      SessionSchema.parse({
        user: currentUser(),
        firm,
        seatsUsed: users.filter((user) => user.isActive).length,
        seatLimit: 10,
        activeCandidates: candidates.filter((candidate) => candidate.status !== "INACTIVE").length,
        candidateLimit: 100,
      }),
    ),
};
