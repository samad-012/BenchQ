import { http } from "./client";
import { SessionSchema, type Session } from "@/lib/schemas/session";

export const sessionApi = {
  current: () =>
    http.get<Session>("/api/session", { schema: SessionSchema }),
};
